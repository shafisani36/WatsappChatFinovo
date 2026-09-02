const reportService =
  require("../services/report.service");

const activityService =
  require("../services/activity.service");

const {
  User,
  WorkSession,
} = require("../models/index.model");

const ping = async (req, res) => {
  try {
    const {
      id: userId,
      tenantId,
    } = req.user;

    const {
      sessionId,
      application,
      appName,
      domain,
      windowTitle,
      activityState,
      category,
      durationSeconds,
      timestamp,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const activity =
      await activityService.recordActivity(
        tenantId,
        userId,
        sessionId,
        {
          application:
            application ||
            appName ||
            null,

          domain:
            domain || null,

          windowTitle:
            windowTitle || null,

          activityState:
            activityState ||
            "ACTIVE",

          category:
            category ||
            "NEUTRAL",

          durationSeconds:
            Number(durationSeconds) || 5,

          timestamp:
            timestamp || new Date(),
        }
      );

    return res.status(201).json({
      message:
        "Activity recorded successfully",

      data: {
        activityId:
          activity.id,

        timestamp:
          activity.timestamp,

        application:
          activity.application,

        windowTitle:
          activity.windowTitle,

        activityState:
          activity.activityState,

        category:
          activity.category,

        durationSeconds:
          activity.durationSeconds,
      },
    });
  } catch (error) {
    console.error(
      "PING ERROR:",
      error
    );

    if (
      error.message ===
      "SESSION_NOT_ACTIVE"
    ) {
      return res.status(404).json({
        message:
          "No active session found",
      });
    }

    return res.status(500).json({
      message:
        "Error recording activity",

      error:
        error.message,
    });
  }
};

const getCurrentActivity =
  async (req, res) => {
    try {
      const {
        id: userId,
        tenantId,
      } = req.user;

      const session =
        await WorkSession.findOne({
          where: {
            userId,
            tenantId,
            status: "ACTIVE",
          },
        });

      if (!session) {
        return res.status(200).json({
          message:
            "No active session",

          data: null,
        });
      }

      const activity =
        await activityService.getCurrentActivity(
          userId,
          tenantId,
          session.id
        );

      if (!activity) {
        return res.status(200).json({
          message:
            "No activity recorded yet",

          data: null,
        });
      }

      return res.status(200).json({
        message:
          "Current activity fetched successfully",

        data: {
          id: activity.id,

          sessionId:
            activity.sessionId,

          application:
            activity.application,

          appName:
            activity.application,

          domain:
            activity.domain,

          windowTitle:
            activity.windowTitle,

          activityState:
            activity.activityState,

          category:
            activity.category,

          durationSeconds:
            activity.durationSeconds,

          timestamp:
            activity.timestamp,
        },
      });
    } catch (error) {
      console.error(
        "CURRENT ACTIVITY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Error fetching current activity",

        error:
          error.message,
      });
    }
  };

const getDailyReport =
  async (req, res) => {
    try {
      const {
        id: userId,
        tenantId,
        role,
      } = req.user;

      const {
        date,
        employeeId,
      } = req.query;

      let targetUserId =
        userId;

      if (
        employeeId &&
        role !== "EMPLOYEE"
      ) {
        const targetUser =
          await User.findOne({
            where: {
              id: employeeId,
              tenantId,
            },
          });

        if (!targetUser) {
          return res.status(404).json({
            message:
              "Employee not found",
          });
        }

        if (
          role === "MANAGER" &&
          targetUser.managerId !== userId
        ) {
          return res.status(403).json({
            message:
              "You can only view reports for your team members",
          });
        }

        targetUserId =
          employeeId;
      }

      if (
        employeeId &&
        role === "EMPLOYEE"
      ) {
        return res.status(403).json({
          message:
            "Employees can only view their own reports",
        });
      }

      const report =
        await reportService.getDailyReport(
          targetUserId,
          tenantId,
          date || null
        );

      return res.status(200).json({
        message:
          "Daily report fetched successfully",

        data: report,
      });
    } catch (error) {
      console.error(
        "DAILY REPORT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Error fetching daily report",

        error:
          error.message,
      });
    }
  };

const getWeeklyReport =
  async (req, res) => {
    try {
      const {
        id: userId,
        tenantId,
        role,
      } = req.user;

      const {
        date,
        employeeId,
      } = req.query;

      let targetUserId =
        userId;

      if (
        employeeId &&
        role !== "EMPLOYEE"
      ) {
        const targetUser =
          await User.findOne({
            where: {
              id: employeeId,
              tenantId,
            },
          });

        if (!targetUser) {
          return res.status(404).json({
            message:
              "Employee not found",
          });
        }

        if (
          role === "MANAGER" &&
          targetUser.managerId !== userId
        ) {
          return res.status(403).json({
            message:
              "You can only view reports for your team members",
          });
        }

        targetUserId =
          employeeId;
      }

      if (
        employeeId &&
        role === "EMPLOYEE"
      ) {
        return res.status(403).json({
          message:
            "Employees can only view their own reports",
        });
      }

      const report =
        await reportService.getWeeklyReport(
          targetUserId,
          tenantId,
          date || null
        );

      return res.status(200).json({
        message:
          "Weekly report fetched successfully",

        data: report,
      });
    } catch (error) {
      console.error(
        "WEEKLY REPORT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Error fetching weekly report",

        error:
          error.message,
      });
    }
  };

const getMonthlyReport =
  async (req, res) => {
    try {
      const {
        id: userId,
        tenantId,
        role,
      } = req.user;

      const {
        date,
        employeeId,
      } = req.query;

      let targetUserId =
        userId;

      if (
        employeeId &&
        role !== "EMPLOYEE"
      ) {
        const targetUser =
          await User.findOne({
            where: {
              id: employeeId,
              tenantId,
            },
          });

        if (!targetUser) {
          return res.status(404).json({
            message:
              "Employee not found",
          });
        }

        if (
          role === "MANAGER" &&
          targetUser.managerId !== userId
        ) {
          return res.status(403).json({
            message:
              "You can only view reports for your team members",
          });
        }

        targetUserId =
          employeeId;
      }

      if (
        employeeId &&
        role === "EMPLOYEE"
      ) {
        return res.status(403).json({
          message:
            "Employees can only view their own reports",
        });
      }

      const report =
        await reportService.getMonthlyReport(
          targetUserId,
          tenantId,
          date || null
        );

      return res.status(200).json({
        message:
          "Monthly report fetched successfully",

        data: report,
      });
    } catch (error) {
      console.error(
        "MONTHLY REPORT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Error fetching monthly report",

        error:
          error.message,
      });
    }
  };

const getTeamReport =
  async (req, res) => {
    try {
      const {
        id: userId,
        tenantId,
        role,
      } = req.user;

      const { date } =
        req.query;

      if (role === "EMPLOYEE") {
        return res.status(403).json({
          message:
            "Employees cannot view team reports",
        });
      }

      const report =
        await reportService.getTeamReport(
          userId,
          tenantId,
          role,
          date || null
        );

      return res.status(200).json({
        message:
          "Team report fetched successfully",

        data: report,
      });
    } catch (error) {
      console.error(
        "TEAM REPORT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Error fetching team report",

        error:
          error.message,
      });
    }
  };

const getEmployeeProgress =
  async (req, res) => {
    try {
      const {
        id: userId,
        tenantId,
        role,
      } = req.user;

      const {
        type = "daily",
        date,
      } = req.query;

      if (
        ![
          "MANAGER",
          "COMPANY_ADMIN",
          "ADMIN",
        ].includes(role)
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view employee progress",
        });
      }

      if (
        ![
          "daily",
          "weekly",
          "monthly",
        ].includes(type)
      ) {
        return res.status(400).json({
          message:
            "Invalid report type",
        });
      }

      const data =
        await reportService.getEmployeeProgress(
          userId,
          tenantId,
          role,
          type,
          date || null
        );

      return res.status(200).json({
        message:
          "Employee progress fetched successfully",

        data,
      });
    } catch (error) {
      console.error(
        "EMPLOYEE PROGRESS ERROR:",
        error
      );

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view employee progress",
        });
      }

      return res.status(500).json({
        message:
          "Error fetching employee progress",

        error:
          error.message,
      });
    }
  };

module.exports = {
  ping,
  getCurrentActivity,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getTeamReport,
  getEmployeeProgress,
};