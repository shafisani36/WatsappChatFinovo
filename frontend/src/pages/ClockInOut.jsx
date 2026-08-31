import {
  useEffect,
  useState,
} from "react";

import api from "../api/axios";
import toast from "react-hot-toast";

export default function ClockInOut() {
  const [currentSession, setCurrentSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [activityState, setActivityState] =
    useState("ACTIVE");

  const [currentCategory, setCurrentCategory] =
    useState("PRODUCTIVE");

  const [currentApplication, setCurrentApplication] =
    useState("Desktop Agent");

  const [currentWindowTitle, setCurrentWindowTitle] =
    useState("Waiting for activity...");

  const fetchSession = async () => {
    try {
      const response =
        await api.get(
          "/sessions/current"
        );

      const session =
        response.data.data;

      setCurrentSession(session);
    } catch (error) {
      setCurrentSession(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentActivity =
    async () => {
      try {
        const response =
          await api.get(
            "/activity/current"
          );

        const activity =
          response.data.data;

        if (!activity) {
          return;
        }

        setActivityState(
          activity.activityState ||
            "ACTIVE"
        );

        setCurrentCategory(
          activity.category ||
            "PRODUCTIVE"
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
          error.response?.data ||
            error.message
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

    const interval =
      setInterval(() => {
        fetchCurrentActivity();
      }, 3000);

    return () =>
      clearInterval(interval);
  }, [currentSession]);

  const handleClockIn =
    async () => {
      try {
        await api.post(
          "/sessions/clock-in",
          {
            deviceId:
              "desktop-agent",
          }
        );

        toast.success(
          "Clocked in successfully"
        );

        setActivityState("ACTIVE");
        setCurrentCategory(
          "PRODUCTIVE"
        );

        await fetchSession();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to clock in"
        );
      }
    };

  const handleClockOut =
    async () => {
      try {
        await api.post(
          "/sessions/clock-out"
        );

        toast.success(
          "Clocked out successfully"
        );

        setCurrentSession(null);
        setActivityState("ACTIVE");
        setCurrentCategory(
          "PRODUCTIVE"
        );
        setCurrentApplication(
          "Desktop Agent"
        );
        setCurrentWindowTitle(
          "Waiting for activity..."
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to clock out"
        );
      }
    };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader-spinner"></div>
        <p>
          Loading tracker...
        </p>
      </div>
    );
  }

  const isIdle =
    activityState === "IDLE";

  const isNonProductive =
    currentCategory ===
    "NON_PRODUCTIVE";

  return (
    <div className="tracker-page">
      <div className="page-header animate-in">
        <div>
          <div className="page-title-row">
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
            Track your working session
            and productivity
          </p>
        </div>
      </div>

      <div className="tracker-layout">
        <section className="dashboard-card tracker-card animate-card">

          <div className="tracker-illustration">
            <div
              className={`tracker-ring ${
                currentSession
                  ? "tracking"
                  : ""
              }`}
            >
              <div className="tracker-ring-inner">
                ◷
              </div>
            </div>
          </div>

          <h2>
            {currentSession
              ? "Your session is active"
              : "Ready to start?"}
          </h2>

          <p className="tracker-description">
            {currentSession
              ? "Your desktop activity is currently being tracked."
              : "Start your work session when you're ready."}
          </p>

          {currentSession ? (
            <>
              <div className="tracker-status-grid">

                <div className="tracker-status-item">
                  <span>
                    Application
                  </span>

                  <strong>
                    {currentApplication}
                  </strong>
                </div>

                <div className="tracker-status-item">
                  <span>
                    Window
                  </span>

                  <strong>
                    {currentWindowTitle}
                  </strong>
                </div>

                <div
                  className={`tracker-status-item ${
                    isIdle
                      ? "idle"
                      : isNonProductive
                      ? "nonproductive"
                      : "productive"
                  }`}
                >
                  <span>
                    Activity
                  </span>

                  <strong>
                    {activityState}
                  </strong>
                </div>

                <div
                  className={`tracker-status-item ${
                    isIdle
                      ? "idle"
                      : isNonProductive
                      ? "nonproductive"
                      : "productive"
                  }`}
                >
                  <span>
                    Category
                  </span>

                  <strong>
                    {isIdle
                      ? "IDLE"
                      : currentCategory}
                  </strong>
                </div>

              </div>

              <button
                onClick={
                  handleClockOut
                }
                className="tracker-button danger-button"
              >
                Clock Out
              </button>
            </>
          ) : (
            <button
              onClick={
                handleClockIn
              }
              className="tracker-button primary-button"
            >
              Clock In
            </button>
          )}
        </section>
      </div>
    </div>
  );
}