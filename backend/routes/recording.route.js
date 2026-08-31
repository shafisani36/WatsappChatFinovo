import express from "express";

import {
uploadRecording,
getRecordings,
} from "../controllers/recording.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
"/upload",
authMiddleware,
upload.single("video"),
uploadRecording
);

router.get(
"/",
authMiddleware,
getRecordings
);

export default router;