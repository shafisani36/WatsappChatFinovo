const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const downloadRoutes = require("./routes/download.routes");
const path = require("path");
const recordingRoutes =
  require("./routes/recording.routes");
const authRoutes = require("./routes/auth.routes");
const sessionRoutes = require("./routes/session.routes");
const activityRoutes = require("./routes/activity.routes");
const reportRoutes = require("./routes/report.routes");
const taskRoutes = require("./routes/task.routes");
const chatRoutes = require("./routes/chat.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const screenshotRoutes = require("./routes/screenshot.routes");
const requestLogger = require("./middlewares/requestLogger.middleware");

const app = express();


app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  "/api/recordings",
  recordingRoutes
);
app.use(requestLogger);


app.use("/api/auth", authRoutes);

app.use("/api/sessions", sessionRoutes);

app.use("/api/activity", activityRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/screenshots", screenshotRoutes);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});


app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;