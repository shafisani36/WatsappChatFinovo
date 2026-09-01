const fs = require("fs");

const Recording = require("../models/recording.model");

const uploadRecording = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Recording file is required",
      });
    }

    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id;

    if (!userId) {
      if (
        req.file.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }

      return res.status(401).json({
        success: false,
        message:
          "User information not found",
      });
    }

    const duration =
      req.body?.duration
        ? Number(req.body.duration)
        : 0;

    const recording =
      await Recording.create({
        userId,

        fileName:
          req.file.originalname,

        filePath:
          `/uploads/recordings/${req.file.filename}`,

        duration,
      });

    return res.status(201).json({
      success: true,
      message:
        "Recording uploaded successfully",

      data: recording,
    });
  } catch (error) {
    console.error(
      "Upload recording error:",
      error
    );

    if (
      req.file?.path &&
      fs.existsSync(
        req.file.path
      )
    ) {
      try {
        fs.unlinkSync(
          req.file.path
        );
      } catch (cleanupError) {
        console.error(
          "Cleanup error:",
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload recording",
      error: error.message,
    });
  }
};


const getRecordings = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User information not found",
      });
    }

    const recordings =
      await Recording.findAll({
        where: {
          userId,
        },

        order: [
          ["createdAt", "DESC"],
        ],
      });

    return res.status(200).json({
      success: true,
      data: recordings,
    });
  } catch (error) {
    console.error(
      "Get recordings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch recordings",
      error: error.message,
    });
  }
};


module.exports = {
  uploadRecording,
  getRecordings,
};