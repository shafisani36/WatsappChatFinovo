import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";

const formatDuration = (
  seconds
) => {
  const value =
    Number(seconds) || 0;

  if (value <= 0) {
    return "00:00:00";
  }

  const hours =
    Math.floor(value / 3600);

  const minutes =
    Math.floor(
      (value % 3600) / 60
    );

  const secs =
    Math.floor(value % 60);

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(
    2,
    "0"
  )}`;
};

export default function Dashboard() {
  const [dailyData, setDailyData] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchDashboard =
    async () => {
      try {
        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        const [
          reportResponse,
          historyResponse,
        ] = await Promise.all([
          api.get(
            `/reports/daily?date=${today}`
          ),

          api.get(
            "/sessions/history?limit=5&offset=0"
          ),
        ]);

        setDailyData(
          reportResponse.data?.data ||
            null
        );

        setHistory(
          historyResponse.data?.data
            ?.sessions || []
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboard();

    const interval =
      setInterval(
        fetchDashboard,
        5000
      );

    return () =>
      clearInterval(interval);
  }, []);

  const productive =
    Number(
      dailyData?.workingTime
    ) || 0;

  const idle =
    Number(
      dailyData?.idleTime
    ) || 0;

  const nonProductive =
    Number(
      dailyData?.nonProductiveTime
    ) ||
    0;

  const totalTracked =
    productive +
    idle +
    nonProductive;

  const productivity =
    totalTracked > 0
      ? Math.round(
          (productive /
            totalTracked) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader-spinner"></div>

        <p>
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">


<div className="page-header animate-in">
  <div>
    <div className="page-title-row">
      <h1>Overview</h1>
      <span className="live-badge">
        <span className="live-dot"></span>
        Live
      </span>
    </div>
    <p>Your productivity at a glance</p>
  </div>

  <Link to="/download-agent" className="tracker-button primary-button" style={{ textDecoration: "none", width: "auto" }}>
    ⬇ Download Desktop Agent
  </Link>
</div>

      <div className="metrics-grid">

        <MetricCard
          label="Total Tracked"
          value={formatDuration(
            totalTracked
          )}
          icon="◷"
        />

        <MetricCard
          label="Productive Time"
          value={formatDuration(
            productive
          )}
          variant="success"
          icon="✓"
        />

        <MetricCard
          label="Non-Productive"
          value={formatDuration(
            nonProductive
          )}
          variant="danger"
          icon="!"
        />

        <MetricCard
          label="Idle Time"
          value={formatDuration(
            idle
          )}
          variant="warning"
          icon="◌"
        />

        <MetricCard
          label="Productivity"
          value={`${productivity}%`}
          variant="success"
          icon="↗"
        />

      </div>

      <div className="dashboard-grid">

        <section className="dashboard-card animate-card">

          <div className="card-header">
            <div>
              <h2>
                Recent Sessions
              </h2>

              <p>
                Your latest tracked sessions
              </p>
            </div>

            <div className="card-icon">
              ◷
            </div>
          </div>

          <div className="session-list">

            {history.length > 0 ? (
              history.map(
                (session) => (
                  <div
                    className="session-row"
                    key={session.id}
                  >

                    <div className="session-time">

                      <div className="session-icon">
                        ◷
                      </div>

                      <div>
                        <strong>
                          {new Date(
                            session.startedAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </strong>

                        <span>
                          Session
                        </span>
                      </div>

                    </div>

                    <div className="session-duration">
                      {formatDuration(
                        session.totalSeconds
                      )}
                    </div>

                    <span
                      className={
                        session.status ===
                        "ACTIVE"
                          ? "status-badge active"
                          : "status-badge"
                      }
                    >
                      {
                        session.status
                      }
                    </span>

                  </div>
                )
              )
            ) : (
              <div className="empty-state">

                <div className="empty-icon">
                  ◷
                </div>

                <p>
                  No sessions recorded yet
                </p>

              </div>
            )}

          </div>

        </section>

        <section className="dashboard-card productivity-card animate-card">

          <div className="card-header">

            <div>
              <h2>
                Productivity
              </h2>

              <p>
                Today's performance
              </p>
            </div>

            <div className="card-icon">
              ↗
            </div>

          </div>

          <div className="productivity-circle">

            <div
              className="productivity-progress"
              style={{
                "--progress": `${
                  productivity * 3.6
                }deg`,
              }}
            >

              <div className="productivity-inner">

                <strong>
                  {productivity}%
                </strong>

                <span>
                  productive
                </span>

              </div>

            </div>

          </div>

          <div className="productivity-breakdown">

            <Breakdown
              label="Productive"
              value={formatDuration(
                productive
              )}
              type="success"
            />

            <Breakdown
              label="Non-Productive"
              value={formatDuration(
                nonProductive
              )}
              type="danger"
            />

            <Breakdown
              label="Idle"
              value={formatDuration(
                idle
              )}
              type="warning"
            />

          </div>

        </section>

      </div>

    </div>
  );
}

function MetricCard({
  label,
  value,
  variant = "",
  icon,
}) {
  return (
    <div className="metric-card animate-card">

      <div className="metric-top">

        <span className="metric-label">
          {label}
        </span>

        <span className="metric-icon">
          {icon}
        </span>

      </div>

      <strong
        className={`metric-value ${variant}`}
      >
        {value}
      </strong>

    </div>
  );
}

function Breakdown({
  label,
  value,
  type,
}) {
  return (
    <div className="breakdown-row">

      <span className="breakdown-label">

        <span
          className={`breakdown-dot ${type}`}
        ></span>

        {label}

      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}