import prisma from "../config/db.js";

export const startTime = async (req, res) => {
  try {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: req.userId,
        endTime: null,
      },
    });

    if (activeEntry) {
      return res.status(400).json({
        success: false,
        message: "Time tracking is already running",
      });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: req.userId,
        startTime: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Time tracking started",
      timeEntry,
    });
  } catch (error) {
    console.error("Start Time Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start time tracking",
    });
  }
};

export const stopTime = async (req, res) => {
  try {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: req.userId,
        endTime: null,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    if (!activeEntry) {
      return res.status(400).json({
        success: false,
        message: "No active time tracking found",
      });
    }

    const endTime = new Date();

    const duration = Math.floor(
      (endTime.getTime() - activeEntry.startTime.getTime()) / 60000
    );

    const timeEntry = await prisma.timeEntry.update({
      where: {
        id: activeEntry.id,
      },
      data: {
        endTime,
        duration,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Time tracking stopped",
      timeEntry,
    });
  } catch (error) {
    console.error("Stop Time Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to stop time tracking",
    });
  }
};

export const getTodayTime = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: req.userId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const totalMinutes = entries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);

    const activeEntry = entries.find(
      (entry) => entry.endTime === null
    );

    return res.status(200).json({
      success: true,
      totalMinutes,
      totalHours: `${Math.floor(totalMinutes / 60)}h ${
        totalMinutes % 60
      }m`,
      sessions: entries.length,
      isTracking: !!activeEntry,
      activeEntry: activeEntry || null,
      entries,
    });
  } catch (error) {
    console.error("Get Today Time Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get today's time data",
    });
  }
};

export const getTimeHistory = async (req, res) => {
  try {
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const totalMinutes = entries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      totalEntries: entries.length,
      totalMinutes,
      entries,
    });
  } catch (error) {
    console.error("Get Time History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get time history",
    });
  }
};