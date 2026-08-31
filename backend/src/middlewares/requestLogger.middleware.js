const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");
const logFile = path.join(logsDir, "requests.log");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const userId = req.user?.id || "anonymous";

    const log = [
      `[${new Date().toISOString()}]`,
      `${req.method}`,
      `${req.originalUrl}`,
      `STATUS=${res.statusCode}`,
      `TIME=${duration}ms`,
      `USER=${userId}`,
      `IP=${req.ip}`,
    ].join(" | ");

    fs.appendFile(logFile, log + "\n", (error) => {
      if (error) {
        console.error("REQUEST LOG ERROR:", error.message);
      }
    });

    console.log(log);
  });

  next();
};

module.exports = requestLogger;