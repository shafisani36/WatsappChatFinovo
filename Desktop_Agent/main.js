const {
  app,
  BrowserWindow,
  session,
  powerMonitor,
} = require("electron");

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ffmpegPath = require("ffmpeg-static");

let mainWindow = null;

let trackingInterval = null;
let screenshotInterval = null;
let recordingCheckInterval = null;

let isTracking = false;
let isTakingScreenshot = false;
let isRecording = false;
let recordingProcess = null;
let recordingStartTime = null;

let currentRecordingFile = null;
let recordingStopRequested = false;

const API_BASE_URL = "http://localhost:3000/api";
const BACKEND_URL = `${API_BASE_URL}/reports/ping`;
const SESSION_URL = `${API_BASE_URL}/sessions/current`;
const SCREENSHOT_URL = `${API_BASE_URL}/screenshots`;
const RECORDING_UPLOAD_URL = `${API_BASE_URL}/recordings/upload`;

const FRONTEND_URL = "http://localhost:5173";

const PING_INTERVAL_MS = 5000;
const IDLE_THRESHOLD_SECS = 5;

const SCREENSHOT_INTERVAL_MS =
  60 * 60 * 1000;

const RECORDING_CHUNK_SECONDS = 10;

const RECORDING_CHECK_INTERVAL_MS = 5000;

const RECORDING_DIR = path.join(
  app.getPath("userData"),
  "recordings"
);

const NON_PRODUCTIVE_APPS = [
  "YouTube",
  "Facebook",
  "Instagram",
  "Netflix",
  "Discord",
  "TikTok",
  "Reddit",
];

const PRODUCTIVE_APPS = [
  "Visual Studio Code",
  "Code",
  "IntelliJ IDEA",
  "Eclipse",
  "Postman",
  "Microsoft Word",
  "Microsoft Excel",
  "Microsoft PowerPoint",
  "Google Chrome",
  "Microsoft Edge",
  "Firefox",
];

function ensureRecordingDirectory() {
  if (!fs.existsSync(RECORDING_DIR)) {
    fs.mkdirSync(RECORDING_DIR, {
      recursive: true,
    });
  }
}

async function getAuthToken() {
  try {
    const cookies =
      await session.defaultSession.cookies.get({
        url: FRONTEND_URL,
        name: "token",
      });

    if (cookies.length > 0) {
      return cookies[0].value;
    }

    return null;
  } catch (error) {
    console.error(
      "Auth token error:",
      error.message
    );

    return null;
  }
}

async function getCurrentSession(token) {
  try {
    const response = await axios.get(
      SESSION_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 10000,
      }
    );

    return response.data?.data || null;
  } catch (error) {
    if (error.response) {
      console.error(
        "Session error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error(
        "Session error:",
        error.message
      );
    }

    return null;
  }
}

async function getActiveWindowInfo() {
  try {
    const { activeWindow } =
      await import("get-windows");

    const windowInfo =
      await activeWindow();

    if (!windowInfo) {
      return {
        appName: "Unknown",
        windowTitle: "Unknown",
      };
    }

    return {
      appName:
        windowInfo.owner?.name ||
        "Unknown",

      windowTitle:
        windowInfo.title ||
        "Unknown",
    };
  } catch (error) {
    console.error(
      "Active window error:",
      error.message
    );

    return {
      appName: "Unknown",
      windowTitle: "Unknown",
    };
  }
}

function classifyActivity(
  appName,
  windowTitle
) {
  const app =
    String(appName || "").toLowerCase();

  const title =
    String(windowTitle || "").toLowerCase();

  for (const item of NON_PRODUCTIVE_APPS) {
    const value = item.toLowerCase();

    if (
      app.includes(value) ||
      title.includes(value)
    ) {
      return "NON_PRODUCTIVE";
    }
  }

  for (const item of PRODUCTIVE_APPS) {
    const value = item.toLowerCase();

    if (
      app.includes(value) ||
      title.includes(value)
    ) {
      return "PRODUCTIVE";
    }
  }

  return "PRODUCTIVE";
}

async function trackOSActivity() {
  if (isTracking) {
    return;
  }

  isTracking = true;

  try {
    const token =
      await getAuthToken();

    if (!token) {
      return;
    }

    const currentSession =
      await getCurrentSession(token);

    if (!currentSession) {
      return;
    }

    const sessionId =
      currentSession.id ||
      currentSession.sessionId;

    if (!sessionId) {
      return;
    }

    const idleSeconds =
      powerMonitor.getSystemIdleTime();

    const isIdle =
      idleSeconds >=
      IDLE_THRESHOLD_SECS;

    const windowInfo =
      await getActiveWindowInfo();

    const appName =
      windowInfo.appName;

    const windowTitle =
      windowInfo.windowTitle;

    const category =
      classifyActivity(
        appName,
        windowTitle
      );

    const activityState =
      isIdle
        ? "IDLE"
        : "ACTIVE";

    const payload = {
      sessionId,
      appName,
      application: appName,
      windowTitle,
      activityState,
      category,
      idleSeconds,
      isIdle,
      durationSeconds:
        PING_INTERVAL_MS / 1000,
    };

    await axios.post(
      BACKEND_URL,
      payload,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },
        withCredentials: true,
        timeout: 10000,
      }
    );
  } catch (error) {
    if (error.response) {
      console.error(
        "Activity error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error(
        "Activity error:",
        error.message
      );
    }
  } finally {
    isTracking = false;
  }
}

async function captureScreen() {
  if (isTakingScreenshot) {
    return;
  }

  isTakingScreenshot = true;

  try {
    const token =
      await getAuthToken();

    if (!token) {
      return;
    }

    const currentSession =
      await getCurrentSession(token);

    if (!currentSession) {
      return;
    }

    const sessionId =
      currentSession.id ||
      currentSession.sessionId;

    if (!sessionId) {
      return;
    }

    const { desktopCapturer } =
      require("electron");

    const sources =
      await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: {
          width: 1920,
          height: 1080,
        },
      });

    if (
      !sources ||
      sources.length === 0
    ) {
      return;
    }

    const image =
      sources[0].thumbnail;

    if (
      !image ||
      image.isEmpty()
    ) {
      return;
    }

    const pngBuffer =
      image.toPNG();

    if (
      !pngBuffer ||
      pngBuffer.length === 0
    ) {
      return;
    }

    const form =
      new FormData();

    form.append(
      "screenshot",
      pngBuffer,
      {
        filename:
          `screenshot_${Date.now()}.png`,
        contentType:
          "image/png",
      }
    );

    form.append(
      "sessionId",
      String(sessionId)
    );

    await axios.post(
      SCREENSHOT_URL,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization:
            `Bearer ${token}`,
        },
        maxContentLength:
          Infinity,
        maxBodyLength:
          Infinity,
        timeout: 30000,
      }
    );

    console.log(
      "Screenshot uploaded."
    );
  } catch (error) {
    if (error.response) {
      console.error(
        "Screenshot error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error(
        "Screenshot error:",
        error.message
      );
    }
  } finally {
    isTakingScreenshot = false;
  }
}

async function uploadRecording(
  filePath,
  durationSeconds,
  sessionId
) {
  try {
    if (
      !fs.existsSync(filePath)
    ) {
      console.error(
        "Recording file does not exist:",
        filePath
      );

      return;
    }

    const token =
      await getAuthToken();

    if (!token) {
      console.log(
        "No token. Recording upload skipped."
      );

      return;
    }

    const stats =
      fs.statSync(filePath);

    if (stats.size === 0) {
      fs.unlinkSync(filePath);
      return;
    }

    const form =
      new FormData();

    form.append(
      "video",
      fs.createReadStream(filePath),
      {
        filename:
          path.basename(filePath),
        contentType:
          "video/mp4",
      }
    );

    form.append(
      "duration",
      String(durationSeconds)
    );

    form.append(
      "sessionId",
      String(sessionId)
    );

    const response =
      await axios.post(
        RECORDING_UPLOAD_URL,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization:
              `Bearer ${token}`,
          },
          maxContentLength:
            Infinity,
          maxBodyLength:
            Infinity,
          timeout: 120000,
        }
      );

    console.log(
      "Recording uploaded:",
      response.status,
      path.basename(filePath)
    );

    fs.unlinkSync(filePath);
  } catch (error) {
    if (error.response) {
      console.error(
        "Recording upload error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error(
        "Recording upload error:",
        error.message
      );
    }
  }
}

async function startRecording() {
  if (isRecording) {
    return;
  }

  if (!ffmpegPath) {
    console.error(
      "FFmpeg was not found."
    );

    return;
  }

  try {
    const token =
      await getAuthToken();

    if (!token) {
      console.log(
        "No token. Recording not started."
      );

      return;
    }

    const currentSession =
      await getCurrentSession(token);

    if (!currentSession) {
      console.log(
        "No active session. Recording not started."
      );

      return;
    }

    const sessionId =
      currentSession.id ||
      currentSession.sessionId;

    if (!sessionId) {
      return;
    }

    ensureRecordingDirectory();

    const timestamp =
      Date.now();

    currentRecordingFile =
      path.join(
        RECORDING_DIR,
        `recording_${timestamp}.mp4`
      );

    recordingStartTime =
      Date.now();

    recordingStopRequested =
      false;

    const args = [
      "-y",
      "-f",
      "gdigrab",
      "-framerate",
      "15",
      "-draw_mouse",
      "1",
      "-i",
      "desktop",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "28",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-t",
      String(RECORDING_CHUNK_SECONDS),
      currentRecordingFile,
    ];

    console.log(
      "Starting screen recording..."
    );

    recordingProcess =
      spawn(
        ffmpegPath,
        args,
        {
          windowsHide: true,
        }
      );

    isRecording = true;

    recordingProcess.stderr.on(
      "data",
      (data) => {
        const message =
          data
            .toString()
            .trim();

        if (
          message.includes(
            "frame="
          ) ||
          message.includes(
            "time="
          )
        ) {
          return;
        }

        console.log(
          `[FFmpeg] ${message}`
        );
      }
    );

    recordingProcess.on(
      "error",
      (error) => {
        console.error(
          "FFmpeg process error:",
          error.message
        );

        isRecording = false;
        recordingProcess = null;
      }
    );

    recordingProcess.on(
      "close",
      async () => {
        const filePath =
          currentRecordingFile;

        const duration =
          recordingStartTime
            ? Math.floor(
                (Date.now() -
                  recordingStartTime) /
                  1000
              )
            : 0;

        const wasRequested =
          recordingStopRequested;

        recordingProcess = null;
        isRecording = false;
        currentRecordingFile = null;
        recordingStartTime = null;

        if (
          filePath &&
          fs.existsSync(filePath)
        ) {
          await uploadRecording(
            filePath,
            duration,
            sessionId
          );
        }

        if (
          !wasRequested &&
          !app.isQuitting
        ) {
          setTimeout(
            () => {
              checkRecordingState();
            },
            1000
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Start recording error:",
      error.message
    );

    isRecording = false;
    recordingProcess = null;
  }
}

function stopRecording() {
  if (
    !recordingProcess
  ) {
    isRecording = false;
    return;
  }

  recordingStopRequested =
    true;

  try {
    recordingProcess.kill(
      "SIGINT"
    );
  } catch (error) {
    try {
      recordingProcess.kill();
    } catch {
      console.error(
        "Unable to stop recording."
      );
    }
  }
}

async function checkRecordingState() {
  try {
    const token =
      await getAuthToken();

    if (!token) {
      if (isRecording) {
        stopRecording();
      }

      return;
    }

    const currentSession =
      await getCurrentSession(token);

    if (!currentSession) {
      if (isRecording) {
        stopRecording();
      }

      return;
    }

    if (!isRecording) {
      await startRecording();
    }
  } catch (error) {
    console.error(
      "Recording state error:",
      error.message
    );
  }
}

function startRecordingSystem() {
  if (recordingCheckInterval) {
    clearInterval(
      recordingCheckInterval
    );
  }

  checkRecordingState();

  recordingCheckInterval =
    setInterval(
      checkRecordingState,
      RECORDING_CHECK_INTERVAL_MS
    );
}

function stopRecordingSystem() {
  if (recordingCheckInterval) {
    clearInterval(
      recordingCheckInterval
    );

    recordingCheckInterval =
      null;
  }

  if (isRecording) {
    stopRecording();
  }
}

function startScreenshotTimer() {
  stopScreenshotTimer();

  screenshotInterval =
    setInterval(
      captureScreen,
      SCREENSHOT_INTERVAL_MS
    );
}

function stopScreenshotTimer() {
  if (screenshotInterval) {
    clearInterval(
      screenshotInterval
    );

    screenshotInterval = null;
  }
}

function createWindow() {
  mainWindow =
    new BrowserWindow({
      width: 1100,
      height: 750,
      show: true,
      title: "Finovo Global",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

  mainWindow.loadURL(
    FRONTEND_URL
  );

  mainWindow.on(
    "close",
    (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  );

  mainWindow.on(
    "closed",
    () => {
      mainWindow = null;
    }
  );
}

app.whenReady().then(
  async () => {
    ensureRecordingDirectory();

    createWindow();

    await trackOSActivity();

    trackingInterval =
      setInterval(
        trackOSActivity,
        PING_INTERVAL_MS
      );

    startScreenshotTimer();

    startRecordingSystem();

    app.on(
      "activate",
      () => {
        if (
          BrowserWindow
            .getAllWindows()
            .length === 0
        ) {
          createWindow();
        } else if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    );
  }
);

app.on(
  "before-quit",
  () => {
    app.isQuitting = true;

    if (trackingInterval) {
      clearInterval(
        trackingInterval
      );

      trackingInterval = null;
    }

    stopScreenshotTimer();

    stopRecordingSystem();
  }
);