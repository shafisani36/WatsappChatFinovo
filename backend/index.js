import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authMiddleware from "./middleware/auth.middleware.js";
import authRoutes from "./routes/auth.route.js";
import timeRoutes from "./routes/time.route.js";
import recordingRoutes from "./routes/recording.route.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TimeTracking API is running",
  });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    userId: req.userId,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/recordings", recordingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});