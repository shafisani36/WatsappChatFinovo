const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  saveScreenshot,
} = require("../controllers/screenshot.controller");

const {
  authenticate,
} = require("../middlewares/auth.middleware");

const router = express.Router();



const screenshotDirectory = path.join(
  __dirname,
  "../../uploads/screenshots"
);

if (!fs.existsSync(screenshotDirectory)) {
  fs.mkdirSync(screenshotDirectory, {
    recursive: true,
  });
}



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, screenshotDirectory);
  },

  filename: (req, file, cb) => {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id ||
      "unknown";

    const sessionId =
      req.body?.sessionId ||
      req.body?.session_id ||
      "unknown";

    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "");

    const filename =
      `screenshot_${userId}_${sessionId}_${timestamp}.png`;

    cb(null, filename);
  },
});



const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(
      new Error("Only PNG screenshots are allowed"),
      false
    );
  }
};



const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});



router.post(
  "/",
  authenticate,
  upload.single("screenshot"),
  saveScreenshot
);

module.exports = router;