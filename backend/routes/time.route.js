import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  startTime,
  stopTime,
  getTodayTime,
  getTimeHistory
} from "../controllers/time.controller.js";

const router = express.Router();

router.post("/start", authMiddleware, startTime);

router.post("/stop", authMiddleware, stopTime);

router.get("/today", authMiddleware, getTodayTime);

router.get("/history", authMiddleware, getTimeHistory);

export default router;