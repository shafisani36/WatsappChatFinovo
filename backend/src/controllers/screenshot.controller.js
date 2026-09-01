const saveScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Screenshot file is required",
      });
    }

    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id ||
      "unknown";

    const sessionId =
      req.body?.sessionId ||
      req.body?.session_id ||
      "unknown";

    console.log("========================================");
    console.log("Screenshot saved");
    console.log("User:", userId);
    console.log("Session:", sessionId);
    console.log("Filename:", req.file.filename);
    console.log("Size:", req.file.size, "bytes");
    console.log("========================================");

    return res.status(201).json({
      success: true,
      message: "Screenshot uploaded successfully",
      data: {
        filename: req.file.filename,
        sessionId,
        userId,
        size: req.file.size,
        path: `/uploads/screenshots/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error("Screenshot controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save screenshot",
    });
  }
};

module.exports = {
  saveScreenshot,
};