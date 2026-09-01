const { WorkSession, ActivityEvent, Settings, User } = require("../models/index.model");
const { Op } = require("sequelize");
const timeCalc = require("./timeCalculation.service");

class SessionService {
  

  async clockIn(userId, tenantId, deviceId = null, taskId = null) {
    const existingActive = await WorkSession.findOne({
      where: {
        userId,
        tenantId,
        status: "ACTIVE",
      },
    });

    if (existingActive) {
      throw new Error("EMPLOYEE_ALREADY_WORKING");
    }

    const transaction = await WorkSession.sequelize.transaction();
    
    try {
      const activeCheck = await WorkSession.findOne({
        where: {
          userId,
          tenantId,
          status: "ACTIVE",
        },
        transaction,
        lock: true,
      });

      if (activeCheck) {
        await transaction.rollback();
        throw new Error("EMPLOYEE_ALREADY_WORKING");
      }

      const session = await WorkSession.create({
        tenantId,
        userId,
        taskId,
        deviceId,
        startedAt: new Date(),
        status: "ACTIVE",
        lastActivityAt: new Date(),
      }, { transaction });

      await transaction.commit();
      return session;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }


  async clockOut(userId, tenantId) {
    const session = await WorkSession.findOne({
      where: {
        userId,
        tenantId,
        status: "ACTIVE",
      },
    });

    if (!session) {
      throw new Error("NO_ACTIVE_SESSION");
    }

    const now = new Date();
    session.endedAt = now;
    session.status = "COMPLETED";
    
    session.totalSeconds = Math.floor((now - session.startedAt) / 1000);
    
    await session.save();
    return session;
  }


  async pauseSession(sessionId, userId, tenantId) {
    const session = await WorkSession.findOne({
      where: {
        id: sessionId,
        userId,
        tenantId,
        status: "ACTIVE",
      },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND_OR_NOT_ACTIVE");
    }

    session.status = "PAUSED";
    await session.save();
    return session;
  }


  async resumeSession(sessionId, userId, tenantId) {
    const session = await WorkSession.findOne({
      where: {
        id: sessionId,
        userId,
        tenantId,
        status: "PAUSED",
      },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND_OR_NOT_PAUSED");
    }

    session.status = "ACTIVE";
    session.lastActivityAt = new Date();
    await session.save();
    return session;
  }

  async getCurrentSession(userId, tenantId) {
    const session = await WorkSession.findOne({
      where: {
        userId,
        tenantId,
        status: ["ACTIVE", "PAUSED"],
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!session) {
      return null;
    }

    if (session.status === "ACTIVE") {
      const now = new Date();
      const elapsed = Math.floor((now - session.startedAt) / 1000);
      session.totalSeconds = elapsed;
    }

    return session;
  }

  async getSessionHistory(userId, tenantId, limit = 50, offset = 0) {
    const { count, rows } = await WorkSession.findAndCountAll({
      where: {
        userId,
        tenantId,
      },
      order: [["startedAt", "DESC"]],
      limit,
      offset,
    });

    return {
      total: count,
      sessions: rows,
    };
  }

  async updateSessionActivity(sessionId, userId, tenantId, activityData) {
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

    session.lastActivityAt = activityData.timestamp || new Date();
    await session.save();
    return session;
  }

 
  async calculateIdleTime(sessionId, userId, tenantId) {
    const session = await WorkSession.findOne({
      where: {
        id: sessionId,
        userId,
        tenantId,
      },
      include: [
        {
          model: ActivityEvent,
          order: [["timestamp", "ASC"]],
        },
      ],
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    const settings = await Settings.findOne({
      where: { tenantId },
    });

    const threshold = settings ? settings.idleThresholdSeconds : 300;

    let idleSeconds = 0;
    const events = session.ActivityEvents || [];

    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];
      
      const diff = (next.timestamp - current.timestamp) / 1000;
      
      if (diff > threshold && current.activityState === "IDLE") {
        idleSeconds += diff;
      }
    }

    session.idleSeconds = idleSeconds;
    await session.save();
    
    return session;
  }
}

module.exports = new SessionService();