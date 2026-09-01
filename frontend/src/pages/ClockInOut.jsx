import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import "../assets/styles/clockinout.css";
export default function ClockInOut() {
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activityState, setActivityState] = useState("ACTIVE");
  const [currentCategory, setCurrentCategory] =
    useState("PRODUCTIVE");

  const [currentApplication, setCurrentApplication] =
    useState("Desktop Agent");

  const [currentWindowTitle, setCurrentWindowTitle] =
    useState("Waiting for activity...");

  const fetchSession = async () => {
    try {
      const response = await api.get("/sessions/current");

      const session = response.data.data;

      setCurrentSession(session);
    } catch (error) {
      setCurrentSession(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentActivity = async () => {
    try {
      const response = await api.get("/activity/current");

      const activity = response.data.data;

      if (!activity) {
        return;
      }

      setActivityState(
        activity.activityState || "ACTIVE"
      );

      setCurrentCategory(
        activity.category || "PRODUCTIVE"
      );

      setCurrentApplication(
        activity.application ||
          activity.appName ||
          "Desktop Agent"
      );

      setCurrentWindowTitle(
        activity.windowTitle ||
          activity.domain ||
          "Unknown"
      );
    } catch (error) {
      console.error(
        "Current activity error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (!currentSession) {
      return;
    }

    fetchCurrentActivity();

    const interval = setInterval(() => {
      fetchCurrentActivity();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const handleClockIn = async () => {
    try {
      await api.post("/sessions/clock-in", {
        deviceId: "desktop-agent",
      });

      toast.success("Clocked in successfully");

      setActivityState("ACTIVE");
      setCurrentCategory("PRODUCTIVE");

      await fetchSession();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to clock in"
      );
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post("/sessions/clock-out");

      toast.success("Clocked out successfully");

      setCurrentSession(null);
      setActivityState("ACTIVE");
      setCurrentCategory("PRODUCTIVE");
      setCurrentApplication("Desktop Agent");
      setCurrentWindowTitle(
        "Waiting for activity..."
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to clock out"
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader">
          <div></div>
        </div>

        <strong>Loading tracker...</strong>
        <span>Preparing your work session</span>
      </div>
    );
  }

  const isIdle = activityState === "IDLE";

  const isNonProductive =
    currentCategory === "NON_PRODUCTIVE";

  const statusClass = isIdle
    ? "idle"
    : isNonProductive
    ? "nonproductive"
    : "productive";

  const displayCategory = isIdle
    ? "IDLE"
    : currentCategory;

  return (
    <div className="dashboard-page tracker-page">

<div className="dashboard-header tracker-header">
        <div className="dashboard-heading">

          <div className="dashboard-title-row">
            <div>
              <div className="dashboard-title-line">

                <h1>
                  Clock In / Out
                </h1>

                {currentSession && (
                  <span className="live-badge">
                    <span className="live-dot"></span>
                    Tracking
                  </span>
                )}

              </div>

              <p>
                Track your working session and
                desktop productivity
              </p>
            </div>

          </div>

        </div>
      </div>

      {currentSession && (
        <div className="dashboard-live-status tracker-live-status">

          <div className="dashboard-live-left">

            <span className="status-pulse"></span>

            <div>
              <strong>
                WORK SESSION ACTIVE
              </strong>

              <span>
                Your desktop activity is currently
                being tracked.
              </span>
            </div>

          </div>

          <span className="dashboard-updated">
            Live monitoring
          </span>

        </div>
      )}

      <div className="tracker-container">

        <section className="dashboard-card tracker-card">

          <div className="tracker-visual">

            <div
              className={`tracker-ring ${
                currentSession ? "tracking" : ""
              }`}
            >
              <div className="tracker-ring-glow"></div>

              <div className="tracker-ring-inner">
                <span>◷</span>
              </div>
            </div>

          </div>

          <div className="tracker-content">

            <span className="section-kicker">
              WORK SESSION
            </span>

            <h2>
              {currentSession
                ? "Your session is active"
                : "Ready to start?"}
            </h2>

            <p className="tracker-description">
              {currentSession
                ? "Your desktop agent is monitoring your activity in real time."
                : "Start your work session when you're ready to begin tracking."}
            </p>

          </div>

          {currentSession ? (
            <>

              <div className="tracker-status-grid">

                <div className="tracker-status-item">
                  <div className="tracker-status-icon">
                    ▣
                  </div>

                  <div className="tracker-status-content">
                    <span>
                      APPLICATION
                    </span>

                    <strong
                      title={currentApplication}
                    >
                      {currentApplication}
                    </strong>
                  </div>
                </div>

                <div className="tracker-status-item">
                  <div className="tracker-status-icon">
                    ▤
                  </div>

                  <div className="tracker-status-content">
                    <span>
                      CURRENT WINDOW
                    </span>

                    <strong
                      title={currentWindowTitle}
                    >
                      {currentWindowTitle}
                    </strong>
                  </div>
                </div>

                <div
                  className={`tracker-status-item ${statusClass}`}
                >
                  <div className="tracker-status-icon">
                    {isIdle
                      ? "Ⅱ"
                      : isNonProductive
                      ? "!"
                      : "✓"}
                  </div>

                  <div className="tracker-status-content">
                    <span>
                      ACTIVITY
                    </span>

                    <strong>
                      {activityState}
                    </strong>
                  </div>

                  <span className="tracker-status-dot"></span>
                </div>

                <div
                  className={`tracker-status-item ${statusClass}`}
                >
                  <div className="tracker-status-icon">
                    ◉
                  </div>

                  <div className="tracker-status-content">
                    <span>
                      CATEGORY
                    </span>

                    <strong>
                      {displayCategory}
                    </strong>
                  </div>

                  <span className="tracker-status-dot"></span>
                </div>

              </div>

              <div
                className={`tracker-current-status ${statusClass}`}
              >
                <div className="tracker-current-status-icon">
                  {isIdle
                    ? "Ⅱ"
                    : isNonProductive
                    ? "!"
                    : "✓"}
                </div>

                <div>
                  <strong>
                    {isIdle
                      ? "You're currently idle"
                      : isNonProductive
                      ? "Non-productive activity detected"
                      : "You're being productive"}
                  </strong>

                  <span>
                    {isIdle
                      ? "The desktop agent detected no recent activity."
                      : isNonProductive
                      ? "The current application is classified as non-productive."
                      : "Your current activity is classified as productive."}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClockOut}
                className="tracker-button danger-button"
              >
                <span>↪</span>
                Clock Out
              </button>

            </>
          ) : (

            <div className="tracker-start-section">

              <div className="tracker-ready-box">
                <div className="tracker-ready-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Desktop agent ready
                  </strong>

                  <span>
                    Start your session to begin
                    activity tracking.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClockIn}
                className="tracker-button primary-button"
              >
                <span>▶</span>
                Clock In
              </button>

            </div>
          )}

        </section>

      </div>

    </div>
  );
}