const sessionService = require("../services/session.service");
const timeCalc = require("../services/timeCalculation.service");


const clockIn = async (req, res) => {
  try {
    const { deviceId, taskId } = req.body;
    const { id: userId, tenantId } = req.user;

    const session = await sessionService.clockIn(
      userId,
      tenantId,
      deviceId || null,
      taskId || null
    );

    res.status(201).json({
      message: "Clock in successful",
      data: {
        sessionId: session.id,
        startedAt: session.startedAt,
        status: session.status,
      },
    });
  } catch (error) {
    if (error.message === "EMPLOYEE_ALREADY_WORKING") {
      return res.status(409).json({
        message: "Employee already has an active session",
      });
    }
    res.status(500).json({
      message: "Error processing clock in",
      error: error.message,
    });
  }
};


const clockOut = async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;

    const session = await sessionService.clockOut(userId, tenantId);

    const metrics = timeCalc.calculateProductivity(session);

    res.status(200).json({
      message: "Clock out successful",
      data: {
        sessionId: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalTrackedTime: metrics.totalTrackedTime,
        totalTrackedTimeFormatted: metrics.totalTrackedTimeFormatted,
        workingTime: metrics.workingTime,
        workingTimeFormatted: metrics.workingTimeFormatted,
        idleTime: metrics.idleTime,
        idleTimeFormatted: metrics.idleTimeFormatted,
        productivityPercentage: metrics.productivityPercentage,
        idlePercentage: metrics.idlePercentage,
      },
    });
  } catch (error) {
    if (error.message === "NO_ACTIVE_SESSION") {
      return res.status(400).json({
        message: "No active session to clock out",
      });
    }
    res.status(500).json({
      message: "Error processing clock out",
      error: error.message,
    });
  }
};

const pauseSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, tenantId } = req.user;

    const session = await sessionService.pauseSession(id, userId, tenantId);

    res.status(200).json({
      message: "Session paused successfully",
      data: {
        sessionId: session.id,
        status: session.status,
        pausedAt: new Date(),
      },
    });
  } catch (error) {
    if (error.message === "SESSION_NOT_FOUND_OR_NOT_ACTIVE") {
      return res.status(404).json({
        message: "No active session found to pause",
      });
    }
    res.status(500).json({
      message: "Error pausing session",
      error: error.message,
    });
  }
};


const resumeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, tenantId } = req.user;

    const session = await sessionService.resumeSession(id, userId, tenantId);

    res.status(200).json({
      message: "Session resumed successfully",
      data: {
        sessionId: session.id,
        status: session.status,
        resumedAt: new Date(),
      },
    });
  } catch (error) {
    if (error.message === "SESSION_NOT_FOUND_OR_NOT_PAUSED") {
      return res.status(404).json({
        message: "No paused session found to resume",
      });
    }
    res.status(500).json({
      message: "Error resuming session",
      error: error.message,
    });
  }
};

const getCurrentSession = async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;

    const session = await sessionService.getCurrentSession(userId, tenantId);

    if (!session) {
      return res.status(200).json({
        message: "No active session",
        data: null,
      });
    }

    let currentDuration = 0;
    let currentDurationFormatted = "00:00:00";

    if (session.status === "ACTIVE") {
      const now = new Date();
      currentDuration = Math.floor((now - session.startedAt) / 1000);
      currentDurationFormatted = timeCalc.formatDuration(currentDuration);
    }

    res.status(200).json({
      message: "Current session fetched successfully",
      data: {
        sessionId: session.id,
        startedAt: session.startedAt,
        status: session.status,
        currentDuration,
        currentDurationFormatted,
        user: session.User,
        taskId: session.taskId,
        deviceId: session.deviceId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching current session",
      error: error.message,
    });
  }
};


const getSessionHistory = async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;
    const { limit = 50, offset = 0 } = req.query;

    const history = await sessionService.getSessionHistory(
      userId,
      tenantId,
      parseInt(limit),
      parseInt(offset)
    );

    const formattedSessions = history.sessions.map(session => {
      const metrics = timeCalc.calculateProductivity(session);
      return {
        id: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        status: session.status,
        totalTrackedTimeFormatted: metrics.totalTrackedTimeFormatted,
        workingTimeFormatted: metrics.workingTimeFormatted,
        idleTimeFormatted: metrics.idleTimeFormatted,
        productivityPercentage: metrics.productivityPercentage,
        idlePercentage: metrics.idlePercentage,
      };
    });

    res.status(200).json({
      message: "Session history fetched successfully",
      data: {
        total: history.total,
        sessions: formattedSessions,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching session history",
      error: error.message,
    });
  }
};

module.exports = {
  clockIn,
  clockOut,
  pauseSession,
  resumeSession,
  getCurrentSession,
  getSessionHistory,
};