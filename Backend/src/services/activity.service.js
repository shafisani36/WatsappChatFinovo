const {
  ActivityEvent,
  WorkSession,
} = require("../models/index.model");

class ActivityService {
  async recordActivity(tenantId, userId, sessionId, data) {
    const session = await WorkSession.findOne({
      where: {
        id: sessionId,
        userId,
        tenantId,
        status: "ACTIVE",
      },
    });

    if (!session) {
      throw new Error("SESSION_NOT_ACTIVE");
    }

    const duration = Number(data.durationSeconds) || 5;
    const activityState = data.activityState || "ACTIVE";
    const category = data.category || "NEUTRAL";

    const activity = await ActivityEvent.create({
      tenantId,
      userId,
      sessionId,
      timestamp: data.timestamp || new Date(),
      application: data.application || null,
      domain: data.domain || null,
      windowTitle: data.windowTitle || null,
      activityState,
      category,
      durationSeconds: duration,
    });

    if (activityState === "IDLE") {
      session.idleSeconds = Number(session.idleSeconds || 0) + duration;
    } else if (category === "PRODUCTIVE") {
      session.workingSeconds = Number(session.workingSeconds || 0) + duration;
    } else if (category === "NON_PRODUCTIVE") {
      session.nonProductiveSeconds =
        Number(session.nonProductiveSeconds || 0) + duration;
    }

    session.lastActivityAt = activity.timestamp;

    session.totalSeconds =
      Number(session.workingSeconds || 0) +
      Number(session.idleSeconds || 0) +
      Number(session.nonProductiveSeconds || 0) +
      Number(session.pausedSeconds || 0);

    await session.save();

    return activity;
  }

  async getCurrentActivity(userId, tenantId, sessionId) {
    const where = { userId, tenantId };

    if (sessionId) {
      where.sessionId = sessionId;
    }

    const activity = await ActivityEvent.findOne({
      where,
      order: [
        ["timestamp", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return activity;
  }

  async getSessionActivitySummary(sessionId, userId, tenantId) {
    const activities = await ActivityEvent.findAll({
      where: { sessionId, userId, tenantId },
      order: [["timestamp", "ASC"]],
    });

    const summary = {
      totalEvents: activities.length,
      activeEvents: activities.filter((a) => a.activityState === "ACTIVE").length,
      idleEvents: activities.filter((a) => a.activityState === "IDLE").length,
      productiveEvents: activities.filter((a) => a.category === "PRODUCTIVE").length,
      nonProductiveEvents: activities.filter((a) => a.category === "NON_PRODUCTIVE").length,
      neutralEvents: activities.filter((a) => a.category === "NEUTRAL").length,
      applications: {},
      domains: {},
    };

    activities.forEach((activity) => {
      if (activity.application) {
        summary.applications[activity.application] =
          (summary.applications[activity.application] || 0) + 1;
      }
      if (activity.domain) {
        summary.domains[activity.domain] =
          (summary.domains[activity.domain] || 0) + 1;
      }
    });

    return summary;
  }

  async getActivityTimeline(sessionId, userId, tenantId) {
    return ActivityEvent.findAll({
      where: { sessionId, userId, tenantId },
      order: [["timestamp", "ASC"]],
      attributes: [
        "timestamp",
        "activityState",
        "category",
        "application",
        "windowTitle",
        "domain",
        "durationSeconds",
      ],
    });
  }
}

module.exports = new ActivityService();