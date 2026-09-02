const express = require("express");

const {
  uploadRecording,
  getRecordings,
} = require(
  "../controllers/recording.controller"
);

const authMiddleware = require(
  "../middlewares/auth.middleware"
);

const upload = require(
  "../middlewares/recordingUpload.middleware"
);

const router =
  express.Router();

router.post(
  "/upload",
  authMiddleware.authenticate,
  upload.single("video"),
  uploadRecording
);

router.get(
  "/",
  authMiddleware.authenticate,
  getRecordings
);

module.exports = router;