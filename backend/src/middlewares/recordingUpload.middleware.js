const multer = require("multer");
const path = require("path");
const fs = require("fs");

const recordingDirectory = path.join(
  __dirname,
  "../../uploads/recordings"
);

if (!fs.existsSync(recordingDirectory)) {
  fs.mkdirSync(recordingDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingDirectory);
  },

  filename: (req, file, cb) => {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id ||
      "unknown";

    const timestamp = Date.now();

    const extension =
      path.extname(file.originalname) ||
      ".webm";

    cb(
      null,
      `recording_${userId}_${timestamp}${extension}`
    );
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "video/webm",
    "video/mp4",
    "video/ogg",
    "video/x-matroska",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only video recording files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      500 * 1024 * 1024,
  },
});

module.exports = upload;