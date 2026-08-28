require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const sequelize = require("./config/db");
require("./models"); // registers associations before sync

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

// CLIENT_URL can be a comma-separated list (useful once you have a Vercel
// preview URL and a production URL at the same time).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ status: "ok", service: "task-leaderboard-backend" }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/leaderboard", leaderboardRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Unexpected server error" });
});

const server = http.createServer(app);

// Socket.IO — pushes live updates to every connected browser tab so the
// task board and leaderboard update instantly instead of needing a refresh.
// The frontend just listens for "task:updated" and "leaderboard:updated"
// and re-fetches the relevant data when it hears one.
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});
io.on("connection", () => {}); // no per-client state needed for this simple setup
app.set("io", io);

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Unable to connect to PostgreSQL:", err.message);
    process.exit(1);
  });
