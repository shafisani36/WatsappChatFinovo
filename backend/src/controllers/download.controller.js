const path = require("path");
const fs = require("fs");

const AGENT_VERSION = "1.0.0";
const INSTALLER_FILENAME = "TrackPulse-Agent-Setup.exe";
const DOWNLOADS_DIR = path.join(__dirname, "../../public/downloads");

const getAgentInfo = (req, res) => {
  const filePath = path.join(DOWNLOADS_DIR, INSTALLER_FILENAME);
  const exists = fs.existsSync(filePath);

  let sizeBytes = null;
  if (exists) {
    sizeBytes = fs.statSync(filePath).size;
  }

  res.status(200).json({
    message: "Agent info fetched successfully",
    data: {
      version: AGENT_VERSION,
      filename: INSTALLER_FILENAME,
      available: exists,
      sizeBytes,
      downloadUrl: "/api/downloads/agent/windows",
    },
  });
};

const downloadAgentWindows = (req, res) => {
  const filePath = path.join(DOWNLOADS_DIR, INSTALLER_FILENAME);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "Installer not found. Please contact your administrator.",
    });
  }

  res.download(filePath, INSTALLER_FILENAME, (error) => {
    if (error) {
      console.error("DOWNLOAD ERROR:", error.message);
    }
  });
};

module.exports = { getAgentInfo, downloadAgentWindows };