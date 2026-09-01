import {
  useEffect,
  useState,
} from "react";

import api from "../api/axios";
import toast from "react-hot-toast";

const formatBytes = (bytes) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

export default function DownloadAgent() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await api.get("/downloads/agent/info");
        setInfo(response.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch agent info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const response = await api.get("/downloads/agent/windows", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", info?.filename || "TrackPulse-Agent-Setup.exe");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      toast.error(
        error.response?.status === 404
          ? "Installer not available yet. Contact your admin."
          : "Failed to download agent"
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader-spinner"></div>
        <p>Checking for the desktop agent...</p>
      </div>
    );
  }

  return (
    <div className="download-page">
      <div className="page-header animate-in">
        <div>
          <h1>Desktop Agent</h1>
          <p>Install the tracker to record your working sessions automatically</p>
        </div>
      </div>

      <section className="dashboard-card animate-card" style={{ maxWidth: 560 }}>
        <div className="card-header">
          <div>
            <h2>TrackPulse Agent for Windows</h2>
            <p>
              {info?.version ? `Version ${info.version}` : "Version unavailable"}
              {info?.sizeBytes ? ` · ${formatBytes(info.sizeBytes)}` : ""}
            </p>
          </div>
          <div className="card-icon">⬇</div>
        </div>

        <p style={{ margin: "16px 0", color: "var(--text-secondary, #666)" }}>
          This installs a small background app that tracks active windows and
          idle time while you're clocked in. It runs quietly in your system
          tray — no need to keep it in focus.
        </p>

        {info?.available ? (
          <button
            onClick={handleDownload}
            className="tracker-button primary-button"
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="button-spinner"></span>
                Preparing download...
              </>
            ) : (
              "Download for Windows"
            )}
          </button>
        ) : (
          <div className="empty-card">
            <p>The installer isn't available right now. Please contact your administrator.</p>
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 13, color: "var(--text-secondary, #888)" }}>
          <strong>After installing:</strong> log in with the same account you
          use on this dashboard, then use Clock In from either the desktop
          app or here — tracking works from both.
        </div>
      </section>
    </div>
  );
}