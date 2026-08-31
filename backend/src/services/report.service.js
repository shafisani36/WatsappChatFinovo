const {
  WorkSession,
  Settings,
  User,
} = require("../models/index.model");

const { Op } = require("sequelize");

const timeCalc = require("./timeCalculation.service");

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
      await User.findByPk(userId, {
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

    /*
     * Also include current active session.
     */

    const activeSession =
      await WorkSession.findOne({
        where: {
          userId,
          tenantId,

          status: [
            "ACTIVE",
            "PAUSED",
          ],
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

    /*
     * COMPLETED SESSIONS
     */

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

    /*
     * ACTIVE SESSION
     *
     * Its activity values are already
     * stored by activity.service.
     */

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

    const { start, end } =
      timeCalc.getDateRange(
        "weekly",
        targetDate
      );

    const user =
      await User.findByPk(userId, {
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

    const { start, end } =
      timeCalc.getDateRange(
        "monthly",
        targetDate
      );

    const user =
      await User.findByPk(userId, {
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
    managerId,
    tenantId,
    date = null
  ) {
    const targetDate = date
      ? new Date(date)
      : new Date();

    const { start, end } =
      timeCalc.getDateRange(
        "weekly",
        targetDate
      );

    const teamMembers =
      await User.findAll({
        where: {
          tenantId,
          managerId,
        },

        attributes: [
          "id",
          "name",
          "email",
          "role",
        ],
      });

    const reports = [];

    for (
      const member of teamMembers
    ) {
      const report =
        await this.getWeeklyReport(
          member.id,
          tenantId,
          date
        );

      reports.push(report);
    }

    const avgProductivity =
      reports.length
        ? reports.reduce(
            (sum, report) =>
              sum +
              report.productivityPercentage,
            0
          ) / reports.length
        : 0;

    const avgProgress =
      reports.length
        ? reports.reduce(
            (sum, report) =>
              sum +
              report.progressPercentage,
            0
          ) / reports.length
        : 0;

    const totalTracked =
      reports.reduce(
        (sum, report) =>
          sum +
          report.totalTrackedTime,
        0
      );

    return {
      period: {
        start:
          start
            .toISOString()
            .split("T")[0],

        end:
          end
            .toISOString()
            .split("T")[0],
      },

      teamSize:
        teamMembers.length,

      teamMembers: reports,

      averages: {
        productivityPercentage:
          avgProductivity,

        progressPercentage:
          avgProgress,

        totalTrackedTime:
          totalTracked,

        totalTrackedTimeFormatted:
          timeCalc.formatDuration(
            totalTracked
          ),
      },
    };
  }
}

module.exports =
  new ReportService();