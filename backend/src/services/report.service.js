const {
  WorkSession,
  Settings,
  User,
} = require("../models/index.model");

const {
  Op,
} = require("sequelize");

const timeCalc =
  require("./timeCalculation.service");

class ReportService {
  async getDailyReport(
    userId,
    tenantId,
    date = null
  ) {
    const targetDate = date
      ? new Date(date)
      : new Date();

    targetDate.setHours(
      0,
      0,
      0,
      0
    );

    const nextDate =
      new Date(targetDate);

    nextDate.setDate(
      nextDate.getDate() + 1
    );

    const user =
      await User.findOne({
        where: {
          id: userId,
          tenantId,
        },
        attributes: [
          "id",
          "name",
          "email",
          "role",
        ],
      });

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND"
      );
    }

    const sessions =
      await WorkSession.findAll({
        where: {
          userId,
          tenantId,

          startedAt: {
            [Op.gte]: targetDate,
            [Op.lt]: nextDate,
          },

          status: "COMPLETED",
        },
      });

    const activeSession =
      await WorkSession.findOne({
        where: {
          userId,
          tenantId,

          status: {
            [Op.in]: [
              "ACTIVE",
              "PAUSED",
            ],
          },
        },
      });

    const settings =
      await Settings.findOne({
        where: {
          tenantId,
        },
      });

    let workingSeconds = 0;
    let idleSeconds = 0;
    let nonProductiveSeconds = 0;
    let pausedSeconds = 0;

    sessions.forEach(
      (session) => {
        workingSeconds +=
          Number(
            session.workingSeconds
          ) || 0;

        idleSeconds +=
          Number(
            session.idleSeconds
          ) || 0;

        nonProductiveSeconds +=
          Number(
            session.nonProductiveSeconds
          ) || 0;

        pausedSeconds +=
          Number(
            session.pausedSeconds
          ) || 0;
      }
    );

    if (activeSession) {
      workingSeconds +=
        Number(
          activeSession.workingSeconds
        ) || 0;

      idleSeconds +=
        Number(
          activeSession.idleSeconds
        ) || 0;

      nonProductiveSeconds +=
        Number(
          activeSession.nonProductiveSeconds
        ) || 0;

      pausedSeconds +=
        Number(
          activeSession.pausedSeconds
        ) || 0;
    }

    const totalTracked =
      workingSeconds +
      idleSeconds +
      nonProductiveSeconds +
      pausedSeconds;

    const expectedHours =
      settings
        ? Number(
            settings.workingHoursPerDay
          )
        : 8;

    const expectedSeconds =
      expectedHours * 3600;

    const productivity =
      timeCalc.calculateProductivity({
        totalSeconds:
          totalTracked,

        workingSeconds,

        idleSeconds,

        pausedSeconds,
      });

    const progress =
      timeCalc.calculateProgress(
        totalTracked,
        expectedSeconds
      );

    return {
      date: targetDate
        .toISOString()
        .split("T")[0],

      employee: user,

      expectedHours,
      expectedSeconds,

      totalTrackedTime:
        totalTracked,

      workingTime:
        workingSeconds,

      idleTime:
        idleSeconds,

      nonProductiveTime:
        nonProductiveSeconds,

      pausedTime:
        pausedSeconds,

      productivityPercentage:
        productivity.productivityPercentage,

      idlePercentage:
        productivity.idlePercentage,

      progressPercentage:
        progress.progressPercentage,

      remainingSeconds:
        progress.remainingSeconds,

      totalTrackedTimeFormatted:
        timeCalc.formatDuration(
          totalTracked
        ),

      workingTimeFormatted:
        timeCalc.formatDuration(
          workingSeconds
        ),

      idleTimeFormatted:
        timeCalc.formatDuration(
          idleSeconds
        ),

      nonProductiveTimeFormatted:
        timeCalc.formatDuration(
          nonProductiveSeconds
        ),

      pausedTimeFormatted:
        timeCalc.formatDuration(
          pausedSeconds
        ),

      sessionsCount:
        sessions.length,

      hasActiveSession:
        !!activeSession,
    };
  }

  async getWeeklyReport(
    userId,
    tenantId,
    date = null
  ) {
    const targetDate = date
      ? new Date(date)
      : new Date();

    const {
      start,
      end,
    } =
      timeCalc.getDateRange(
        "weekly",
        targetDate
      );

    const user =
      await User.findOne({
        where: {
          id: userId,
          tenantId,
        },
        attributes: [
          "id",
          "name",
          "email",
          "role",
        ],
      });

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND"
      );
    }

    const sessions =
      await WorkSession.findAll({
        where: {
          userId,
          tenantId,

          startedAt: {
            [Op.gte]: start,
            [Op.lt]: end,
          },

          status: "COMPLETED",
        },
      });

    const settings =
      await Settings.findOne({
        where: {
          tenantId,
        },
      });

    let workingSeconds = 0;
    let idleSeconds = 0;
    let nonProductiveSeconds = 0;
    let pausedSeconds = 0;

    sessions.forEach(
      (session) => {
        workingSeconds +=
          Number(
            session.workingSeconds
          ) || 0;

        idleSeconds +=
          Number(
            session.idleSeconds
          ) || 0;

        nonProductiveSeconds +=
          Number(
            session.nonProductiveSeconds
          ) || 0;

        pausedSeconds +=
          Number(
            session.pausedSeconds
          ) || 0;
      }
    );

    const totalTracked =
      workingSeconds +
      idleSeconds +
      nonProductiveSeconds +
      pausedSeconds;

    const hoursPerDay =
      settings
        ? Number(
            settings.workingHoursPerDay
          )
        : 8;

    const workingDays =
      settings
        ? Number(
            settings.workingDaysPerWeek
          )
        : 5;

    const expectedHours =
      hoursPerDay * workingDays;

    const expectedSeconds =
      expectedHours * 3600;

    const productivity =
      timeCalc.calculateProductivity({
        totalSeconds:
          totalTracked,

        workingSeconds,

        idleSeconds,

        pausedSeconds,
      });

    const progress =
      timeCalc.calculateProgress(
        totalTracked,
        expectedSeconds
      );

    return {
      weekStart:
        start
          .toISOString()
          .split("T")[0],

      weekEnd:
        end
          .toISOString()
          .split("T")[0],

      employee: user,

      expectedHours,
      expectedSeconds,

      totalTrackedTime:
        totalTracked,

      workingTime:
        workingSeconds,

      idleTime:
        idleSeconds,

      nonProductiveTime:
        nonProductiveSeconds,

      pausedTime:
        pausedSeconds,

      productivityPercentage:
        productivity.productivityPercentage,

      idlePercentage:
        productivity.idlePercentage,

      progressPercentage:
        progress.progressPercentage,

      remainingSeconds:
        progress.remainingSeconds,

      remainingHours:
        progress.remainingSeconds /
        3600,

      totalTrackedTimeFormatted:
        timeCalc.formatDuration(
          totalTracked
        ),

      workingTimeFormatted:
        timeCalc.formatDuration(
          workingSeconds
        ),

      idleTimeFormatted:
        timeCalc.formatDuration(
          idleSeconds
        ),

      nonProductiveTimeFormatted:
        timeCalc.formatDuration(
          nonProductiveSeconds
        ),

      pausedTimeFormatted:
        timeCalc.formatDuration(
          pausedSeconds
        ),

      sessionsCount:
        sessions.length,

      daysWorked:
        sessions.length,
    };
  }

  async getMonthlyReport(
    userId,
    tenantId,
    date = null
  ) {
    const targetDate = date
      ? new Date(date)
      : new Date();

    const {
      start,
      end,
    } =
      timeCalc.getDateRange(
        "monthly",
        targetDate
      );

    const user =
      await User.findOne({
        where: {
          id: userId,
          tenantId,
        },
        attributes: [
          "id",
          "name",
          "email",
          "role",
        ],
      });

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND"
      );
    }

    const sessions =
      await WorkSession.findAll({
        where: {
          userId,
          tenantId,

          startedAt: {
            [Op.gte]: start,
            [Op.lt]: end,
          },

          status: "COMPLETED",
        },
      });

    const settings =
      await Settings.findOne({
        where: {
          tenantId,
        },
      });

    let workingSeconds = 0;
    let idleSeconds = 0;
    let nonProductiveSeconds = 0;
    let pausedSeconds = 0;

    sessions.forEach(
      (session) => {
        workingSeconds +=
          Number(
            session.workingSeconds
          ) || 0;

        idleSeconds +=
          Number(
            session.idleSeconds
          ) || 0;

        nonProductiveSeconds +=
          Number(
            session.nonProductiveSeconds
          ) || 0;

        pausedSeconds +=
          Number(
            session.pausedSeconds
          ) || 0;
      }
    );

    const totalTracked =
      workingSeconds +
      idleSeconds +
      nonProductiveSeconds +
      pausedSeconds;

    const expectedSeconds =
      timeCalc.getExpectedWorkingSeconds(
        settings || {
          workingHoursPerDay: 8,
          workingDaysPerWeek: 5,
        },
        start,
        end
      );

    const expectedHours =
      expectedSeconds / 3600;

    const productivity =
      timeCalc.calculateProductivity({
        totalSeconds:
          totalTracked,

        workingSeconds,

        idleSeconds,

        pausedSeconds,
      });

    const progress =
      timeCalc.calculateProgress(
        totalTracked,
        expectedSeconds
      );

    return {
      month:
        targetDate
          .toISOString()
          .split("T")[0]
          .slice(0, 7),

      startDate:
        start
          .toISOString()
          .split("T")[0],

      endDate:
        end
          .toISOString()
          .split("T")[0],

      employee: user,

      expectedHours,
      expectedSeconds,

      totalTrackedTime:
        totalTracked,

      workingTime:
        workingSeconds,

      idleTime:
        idleSeconds,

      nonProductiveTime:
        nonProductiveSeconds,

      pausedTime:
        pausedSeconds,

      productivityPercentage:
        productivity.productivityPercentage,

      idlePercentage:
        productivity.idlePercentage,

      progressPercentage:
        progress.progressPercentage,

      remainingSeconds:
        progress.remainingSeconds,

      remainingHours:
        progress.remainingSeconds /
        3600,

      totalTrackedTimeFormatted:
        timeCalc.formatDuration(
          totalTracked
        ),

      workingTimeFormatted:
        timeCalc.formatDuration(
          workingSeconds
        ),

      idleTimeFormatted:
        timeCalc.formatDuration(
          idleSeconds
        ),

      nonProductiveTimeFormatted:
        timeCalc.formatDuration(
          nonProductiveSeconds
        ),

      pausedTimeFormatted:
        timeCalc.formatDuration(
          pausedSeconds
        ),

      sessionsCount:
        sessions.length,

      daysWorked:
        sessions.length,
    };
  }

  async getTeamReport(
    viewerId,
    tenantId,
    role,
    date = null,
    period = "daily"
  ) {
    let where = {
      tenantId,
      role: "EMPLOYEE",
    };

    if (role === "MANAGER") {
      where.managerId = viewerId;
    }

    const teamMembers =
      await User.findAll({
        where,

        attributes: [
          "id",
          "name",
          "email",
          "role",
          "managerId",
          "teamId",
        ],

        order: [
          ["name", "ASC"],
        ],
      });

    const reports = [];

    for (
      const member of teamMembers
    ) {
      let report;

      if (period === "weekly") {
        report =
          await this.getWeeklyReport(
            member.id,
            tenantId,
            date
          );
      } else if (
        period === "monthly"
      ) {
        report =
          await this.getMonthlyReport(
            member.id,
            tenantId,
            date
          );
      } else {
        report =
          await this.getDailyReport(
            member.id,
            tenantId,
            date
          );
      }

      reports.push(report);
    }

    const avgProductivity =
      reports.length
        ? reports.reduce(
            (sum, report) =>
              sum +
              Number(
                report.productivityPercentage
              ),
            0
          ) / reports.length
        : 0;

    const avgProgress =
      reports.length
        ? reports.reduce(
            (sum, report) =>
              sum +
              Number(
                report.progressPercentage
              ),
            0
          ) / reports.length
        : 0;

    const totalTracked =
      reports.reduce(
        (sum, report) =>
          sum +
          Number(
            report.totalTrackedTime
          ),
        0
      );

    const totalWorking =
      reports.reduce(
        (sum, report) =>
          sum +
          Number(
            report.workingTime
          ),
        0
      );

    const totalIdle =
      reports.reduce(
        (sum, report) =>
          sum +
          Number(
            report.idleTime
          ),
        0
      );

    const totalNonProductive =
      reports.reduce(
        (sum, report) =>
          sum +
          Number(
            report.nonProductiveTime
          ),
        0
      );

    return {
      period,

      teamSize:
        teamMembers.length,

      teamMembers:
        reports,

      totals: {
        totalTrackedTime:
          totalTracked,

        totalWorkingTime:
          totalWorking,

        totalIdleTime:
          totalIdle,

        totalNonProductiveTime:
          totalNonProductive,

        totalTrackedTimeFormatted:
          timeCalc.formatDuration(
            totalTracked
          ),

        totalWorkingTimeFormatted:
          timeCalc.formatDuration(
            totalWorking
          ),

        totalIdleTimeFormatted:
          timeCalc.formatDuration(
            totalIdle
          ),

        totalNonProductiveTimeFormatted:
          timeCalc.formatDuration(
            totalNonProductive
          ),
      },

      averages: {
        productivityPercentage:
          avgProductivity,

        progressPercentage:
          avgProgress,

        totalTrackedTime:
          reports.length
            ? totalTracked /
              reports.length
            : 0,

        totalTrackedTimeFormatted:
          timeCalc.formatDuration(
            reports.length
              ? totalTracked /
                  reports.length
              : 0
          ),
      },
    };
  }

  async getEmployeeProgress(
    viewerId,
    tenantId,
    role,
    type = "daily",
    date = null
  ) {
    if (
      ![
        "MANAGER",
        "COMPANY_ADMIN",
        "ADMIN",
      ].includes(role)
    ) {
      throw new Error("FORBIDDEN");
    }

    let where = {
      tenantId,
      role: "EMPLOYEE",
    };

    if (role === "MANAGER") {
      where.managerId = viewerId;
    }

    const employees =
      await User.findAll({
        where,

        attributes: [
          "id",
          "name",
          "email",
          "role",
          "managerId",
          "teamId",
        ],

        order: [
          ["name", "ASC"],
        ],
      });

    const employeesProgress = [];

    for (
      const employee of employees
    ) {
      let report;

      if (type === "weekly") {
        report =
          await this.getWeeklyReport(
            employee.id,
            tenantId,
            date
          );
      } else if (
        type === "monthly"
      ) {
        report =
          await this.getMonthlyReport(
            employee.id,
            tenantId,
            date
          );
      } else {
        report =
          await this.getDailyReport(
            employee.id,
            tenantId,
            date
          );
      }

      employeesProgress.push({
        employee:
          report.employee,

        progressPercentage:
          Number(
            report.progressPercentage
          ) || 0,

        productivityPercentage:
          Number(
            report.productivityPercentage
          ) || 0,

        totalTrackedTime:
          Number(
            report.totalTrackedTime
          ) || 0,

        totalTrackedTimeFormatted:
          report.totalTrackedTimeFormatted,

        workingTime:
          Number(
            report.workingTime
          ) || 0,

        workingTimeFormatted:
          report.workingTimeFormatted,

        idleTime:
          Number(
            report.idleTime
          ) || 0,

        idleTimeFormatted:
          report.idleTimeFormatted,

        nonProductiveTime:
          Number(
            report.nonProductiveTime
          ) || 0,

        nonProductiveTimeFormatted:
          report.nonProductiveTimeFormatted,

        pausedTime:
          Number(
            report.pausedTime
          ) || 0,

        pausedTimeFormatted:
          report.pausedTimeFormatted,

        expectedHours:
          Number(
            report.expectedHours
          ) || 0,

        remainingSeconds:
          Number(
            report.remainingSeconds
          ) || 0,

        remainingHours:
          Number(
            report.remainingHours
          ) || 0,

        sessionsCount:
          Number(
            report.sessionsCount
          ) || 0,

        hasActiveSession:
          !!report.hasActiveSession,
      });
    }

    const totalEmployees =
      employeesProgress.length;

    const totalTrackedTime =
      employeesProgress.reduce(
        (sum, employee) =>
          sum +
          employee.totalTrackedTime,
        0
      );

    const totalWorkingTime =
      employeesProgress.reduce(
        (sum, employee) =>
          sum +
          employee.workingTime,
        0
      );

    const totalIdleTime =
      employeesProgress.reduce(
        (sum, employee) =>
          sum +
          employee.idleTime,
        0
      );

    const totalNonProductiveTime =
      employeesProgress.reduce(
        (sum, employee) =>
          sum +
          employee.nonProductiveTime,
        0
      );

    const averageProgress =
      totalEmployees
        ? employeesProgress.reduce(
            (sum, employee) =>
              sum +
              employee.progressPercentage,
            0
          ) / totalEmployees
        : 0;

    const averageProductivity =
      totalEmployees
        ? employeesProgress.reduce(
            (sum, employee) =>
              sum +
              employee.productivityPercentage,
            0
          ) / totalEmployees
        : 0;

    return {
      type,

      date: date
        ? new Date(date)
            .toISOString()
            .split("T")[0]
        : new Date()
            .toISOString()
            .split("T")[0],

      teamSize:
        totalEmployees,

      employees:
        employeesProgress,

      averages: {
        progressPercentage:
          averageProgress,

        productivityPercentage:
          averageProductivity,
      },

      totals: {
        totalTrackedTime,

        totalWorkingTime,

        totalIdleTime,

        totalNonProductiveTime,

        totalTrackedTimeFormatted:
          timeCalc.formatDuration(
            totalTrackedTime
          ),

        totalWorkingTimeFormatted:
          timeCalc.formatDuration(
            totalWorkingTime
          ),

        totalIdleTimeFormatted:
          timeCalc.formatDuration(
            totalIdleTime
          ),

        totalNonProductiveTimeFormatted:
          timeCalc.formatDuration(
            totalNonProductiveTime
          ),
      },
    };
  }
}

module.exports =
  new ReportService();