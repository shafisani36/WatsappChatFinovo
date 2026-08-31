const { WorkSession } = require("../models/index.model");
const activityService = require("../services/activity.service");

const getCurrentActivity = async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;

    const session = await WorkSession.findOne({
      where: {
        userId,
        tenantId,
        status: "ACTIVE",
      },
    });

    if (!session) {
      return res.status(200).json({
        message: "No active session",
        data: null,
      });
    }

    const activity = await activityService.getCurrentActivity(
      userId,
      tenantId,
      session.id
    );

    if (!activity) {
      return res.status(200).json({
        message: "No activity recorded yet",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Current activity fetched successfully",
      data: {
        id: activity.id,
        sessionId: activity.sessionId,
        application: activity.application,
        appName: activity.application,
        domain: activity.domain,
        windowTitle: activity.windowTitle,
        activityState: activity.activityState,
        category: activity.category,
        durationSeconds: activity.durationSeconds,
        timestamp: activity.timestamp,
      },
    });
  } catch (error) {
    console.error("CURRENT ACTIVITY ERROR:", error);

    return res.status(500).json({
      message: "Error fetching current activity",
      error: error.message,
    });
  }
};

module.exports = { getCurrentActivity };