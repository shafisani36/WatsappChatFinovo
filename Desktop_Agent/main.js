const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  session,
  powerMonitor,
} = require("electron");

const axios = require("axios");
const path = require("path");

let mainWindow = null;
let tray = null;
let trackingInterval = null;
let isTracking = false;

const API_BASE_URL = "http://localhost:3000/api";
const BACKEND_URL = `${API_BASE_URL}/reports/ping`;
const SESSION_URL = `${API_BASE_URL}/sessions/current`;
const FRONTEND_URL = "http://localhost:5173";

const PING_INTERVAL_MS = 5000;
const IDLE_THRESHOLD_SECS = 5; 

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

async function getAuthToken() {
  try {
    const cookies = await session.defaultSession.cookies.get({
      url: FRONTEND_URL,
      name: "token",
    });

    if (cookies.length > 0) {
      return cookies[0].value;
    }

    return null;
  } catch (error) {
    console.error("Auth token error:", error.message);
    return null;
  }
}

async function getCurrentSession(token) {
  try {
    const response = await axios.get(SESSION_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
      timeout: 10000,
    });

    const sessionData = response.data?.data;

    if (!sessionData) {
      return null;
    }

    return sessionData;
  } catch (error) {
    if (error.response) {
      console.error("Session error:", error.response.status, error.response.data);
    } else {
      console.error("Session error:", error.message);
    }

    return null;
  }
}

async function getActiveWindowInfo() {
  try {
    const { activeWindow } = await import("get-windows");
    const windowInfo = await activeWindow();

    if (!windowInfo) {
      return { appName: "Unknown", windowTitle: "Unknown" };
    }

    return {
      appName: windowInfo.owner?.name || "Unknown",
      windowTitle: windowInfo.title || "Unknown",
    };
  } catch (error) {
    console.error("Active window error:", error.message);
    return { appName: "Unknown", windowTitle: "Unknown" };
  }
}

/**
 * Classifies ONLY the category (PRODUCTIVE / NON_PRODUCTIVE).
 * "IDLE" is never returned here — it's a separate activityState,
 * not a valid value for the category ENUM in the database.
 */
function classifyActivity(appName, windowTitle) {
  const app = appName.toLowerCase();
  const title = windowTitle.toLowerCase();

  for (const item of NON_PRODUCTIVE_APPS) {
    if (app.includes(item.toLowerCase()) || title.includes(item.toLowerCase())) {
      return "NON_PRODUCTIVE";
    }
  }

  for (const item of PRODUCTIVE_APPS) {
    if (app.includes(item.toLowerCase()) || title.includes(item.toLowerCase())) {
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
    const token = await getAuthToken();

    if (!token) {
      console.log("No token - tracking skipped.");
      return;
    }

    const currentSession = await getCurrentSession(token);

    if (!currentSession) {
      console.log("No active work session - activity skipped.");
      return;
    }

    const sessionId = currentSession.id || currentSession.sessionId;

    if (!sessionId) {
      console.error(
        "Current session response does not contain sessionId:",
        currentSession
      );
      return;
    }


    const idleSeconds = powerMonitor.getSystemIdleTime();
    const isIdle = idleSeconds >= IDLE_THRESHOLD_SECS;

    const windowInfo = await getActiveWindowInfo();
    const appName = windowInfo.appName;
    const windowTitle = windowInfo.windowTitle;

    const category = classifyActivity(appName, windowTitle);
    const activityState = isIdle ? "IDLE" : "ACTIVE";

    const payload = {
      sessionId,
      appName,
      application: appName,
      windowTitle,
      activityState,
      category,
      idleSeconds,
      isIdle,
      durationSeconds: PING_INTERVAL_MS / 1000,
    };


    console.log("\n========================================");
    console.log("Session ID:", sessionId);
    console.log("Application:", appName);
    console.log("Window:", windowTitle);
    console.log("Idle:", idleSeconds, "seconds");
    console.log("Activity:", activityState);
    console.log("Category:", category);
    console.log("Duration:", payload.durationSeconds, "seconds");
    console.log("========================================");


    const response = await axios.post(BACKEND_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
      timeout: 10000,
    });

    console.log("Backend:", response.status, response.data?.message || "");
  } catch (error) {
    if (error.response) {
      console.error("Backend error:", error.response.status, error.response.data);
    } else {
      console.error("Tracking error:", error.message);
    }
  } finally {
    isTracking = false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    show: true,
    title: "TrackPulse Agent",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(FRONTEND_URL);

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}


function createTray() {
  try {
    tray = new Tray(path.join(__dirname, "icon.png"));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open Dashboard",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit TrackPulse",
        click: () => {
          app.isQuitting = true;
          if (trackingInterval) {
            clearInterval(trackingInterval);
          }
          app.quit();
        },
      },
    ]);

    tray.setToolTip("TrackPulse Desktop Tracker");
    tray.setContextMenu(contextMenu);
  } catch (error) {
    console.error("Tray error:", error.message);
  }
}

app.whenReady().then(async () => {
  createWindow();
  createTray();

  await trackOSActivity();

  trackingInterval = setInterval(trackOSActivity, PING_INTERVAL_MS);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  app.isQuitting = true;

  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
});