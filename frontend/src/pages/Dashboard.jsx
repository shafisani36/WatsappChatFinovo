import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/dashboard.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import api from "../api/axios";

const formatDuration = (seconds) => {
  const value = Number(seconds) || 0;

  if (value <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(value / 3600);

  const minutes = Math.floor(
    (value % 3600) / 60
  );

  const secs = Math.floor(value % 60);

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


const formatShortDuration = (seconds) => {
  const value = Number(seconds) || 0;

  if (value <= 0) {
    return "0m";
  }

  const hours = Math.floor(value / 3600);

  const minutes = Math.floor(
    (value % 3600) / 60
  );

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};


export default function Dashboard() {
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());


  const fetchDashboard = async () => {
    try {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const response = await api.get(
        `/reports/daily?date=${today}`
      );

      setDailyData(
        response.data?.data || null
      );

      setLastUpdated(new Date());

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

    const interval = setInterval(
      fetchDashboard,
      5000
    );

    return () => clearInterval(interval);
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
    ) || 0;

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


  const activityData = useMemo(() => {
    return [
      {
        name: "Productive",
        minutes: Math.round(
          productive / 60
        ),
      },
      {
        name: "Non-productive",
        minutes: Math.round(
          nonProductive / 60
        ),
      },
      {
        name: "Idle",
        minutes: Math.round(
          idle / 60
        ),
      },
    ];
  }, [
    productive,
    nonProductive,
    idle,
  ]);


  const distributionData = useMemo(() => {
    return [
      {
        name: "Productive",
        value: productive,
      },
      {
        name: "Non-productive",
        value: nonProductive,
      },
      {
        name: "Idle",
        value: idle,
      },
    ].filter(
      (item) => item.value > 0
    );
  }, [
    productive,
    nonProductive,
    idle,
  ]);

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="dashboard-loader">
          <div></div>
        </div>

        <strong>
          Preparing your dashboard
        </strong>

        <span>
          Loading your productivity data...
        </span>

      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

        <div className="dashboard-heading">

          <div className="dashboard-title-row">


            <div>

              <div className="dashboard-title-line">

                <h1>
                  Overview
                </h1>

              </div>

              <p>
                Your productivity at a glance
              </p>

            </div>

          </div>

        </div>


        <Link
          to="/download-agent"
          className="dashboard-agent-button"
        >

          <span className="dashboard-agent-icon">
            ↓
          </span>

          <span>
            Desktop Agent
          </span>

          <span className="dashboard-agent-arrow">
            →
          </span>

        </Link>

      </header>

<div className="dashboard-status-bar">
  <div className="dashboard-status-left">
    <span className="status-pulse"></span>
    <div>
      <strong>Tracking is running</strong>
      <span>Your activity is being monitored automatically</span>
    </div>
  </div>

  <div className="dashboard-status-time">
    Updated{" "}
    {lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}
  </div>
</div>

      <section className="dashboard-kpi-grid">

        <MetricCard
          label="Total tracked"
          value={formatDuration(
            totalTracked
          )}
          icon="◷"
          description="Total activity today"
          delay="0.05s"
        />

        <MetricCard
          label="Productive"
          value={formatDuration(
            productive
          )}
          icon="✓"
          variant="success"
          description="Focused work time"
          delay="0.1s"
        />

        <MetricCard
          label="Non-productive"
          value={formatDuration(
            nonProductive
          )}
          icon="!"
          variant="danger"
          description="Distraction time"
          delay="0.15s"
        />

        <MetricCard
          label="Idle"
          value={formatDuration(
            idle
          )}
          icon="◌"
          variant="warning"
          description="Inactive time"
          delay="0.2s"
        />

        <MetricCard
          label="Productivity"
          value={`${productivity}%`}
          icon="↗"
          variant="success"
          description="Overall efficiency"
          progress={productivity}
          delay="0.25s"
        />

      </section>


      <section className="dashboard-analytics-grid">

        <div className="dashboard-card analytics-card">

          <div className="analytics-card-header">

            <div>

              <span className="section-kicker">
                ACTIVITY
              </span>

              <h2>
                Time distribution
              </h2>

              <p>
                How your tracked time is being spent today
              </p>

            </div>

            <div className="analytics-icon">
              ◔
            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={activityData}
                margin={{
                  top: 15,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eef1f5"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#64748b",
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{
                    fontSize: 9,
                    fill: "#94a3b8",
                  }}
                  tickFormatter={(value) =>
                    `${value}m`
                  }
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(79, 70, 229, 0.04)",
                  }}
                  contentStyle={{
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow:
                      "0 10px 30px rgba(15,23,42,0.08)",
                    fontSize: "11px",
                  }}
                  formatter={(value) => [
                    `${value} min`,
                    "Time",
                  ]}
                />

                <Bar
                  dataKey="minutes"
                  radius={[
                    7,
                    7,
                    2,
                    2,
                  ]}
                  animationDuration={1000}
                  animationBegin={150}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>


          <div className="chart-footer">

            <ChartLegend
              label="Productive"
              value={formatShortDuration(
                productive
              )}
              type="productive"
            />

            <ChartLegend
              label="Non-productive"
              value={formatShortDuration(
                nonProductive
              )}
              type="nonproductive"
            />

            <ChartLegend
              label="Idle"
              value={formatShortDuration(
                idle
              )}
              type="idle"
            />

          </div>

        </div>

        <div className="dashboard-card productivity-card">

          <div className="analytics-card-header">

            <div>

              <span className="section-kicker">
                PERFORMANCE
              </span>

              <h2>
                Productivity score
              </h2>

              <p>
                Your efficiency for today
              </p>

            </div>

            <div className="analytics-icon">
              ↗
            </div>

          </div>


          <div className="productivity-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={[
                    {
                      name: "Productive",
                      value: productivity,
                    },
                    {
                      name: "Remaining",
                      value:
                        100 -
                        productivity,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={76}
                  outerRadius={94}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1200}
                >

                  <Cell fill="#10b981" />

                  <Cell fill="#edf1f4" />

                </Pie>

              </PieChart>

            </ResponsiveContainer>


            <div className="productivity-center">

              <strong>
                {productivity}%
              </strong>

              <span>
                productive
              </span>

            </div>

          </div>


          <div className="productivity-message">

            <div className="message-icon">
              {productivity >= 70
                ? "✦"
                : "↗"}
            </div>

            <div>

              <strong>
                {productivity >= 80
                  ? "Excellent focus"
                  : productivity >= 60
                  ? "Good progress"
                  : totalTracked > 0
                  ? "Room to improve"
                  : "Start tracking"}
              </strong>

              <span>
                {productivity >= 80
                  ? "You're maintaining strong productivity."
                  : productivity >= 60
                  ? "Keep your focus going."
                  : totalTracked > 0
                  ? "Try reducing inactive and distracting time."
                  : "Track your first session to see insights."}
              </span>

            </div>

          </div>


          <div className="productivity-stats">

            <MiniStat
              label="Focused"
              value={formatShortDuration(
                productive
              )}
              percentage={
                totalTracked > 0
                  ? Math.round(
                      (productive /
                        totalTracked) *
                        100
                    )
                  : 0
              }
              type="success"
            />

            <MiniStat
              label="Idle"
              value={formatShortDuration(
                idle
              )}
              percentage={
                totalTracked > 0
                  ? Math.round(
                      (idle /
                        totalTracked) *
                        100
                    )
                  : 0
              }
              type="warning"
            />

            <MiniStat
              label="Distraction"
              value={formatShortDuration(
                nonProductive
              )}
              percentage={
                totalTracked > 0
                  ? Math.round(
                      (nonProductive /
                        totalTracked) *
                        100
                    )
                  : 0
              }
              type="danger"
            />

          </div>

        </div>

      </section>

      <section className="dashboard-card trend-card">

        <div className="analytics-card-header">

          <div>

            <span className="section-kicker">
              INSIGHT
            </span>

            <h2>
              Today's productivity snapshot
            </h2>

            <p>
              A visual view of your current activity balance
            </p>

          </div>


          <div className="trend-score">

            <span>
              SCORE
            </span>

            <strong>
              {productivity}%
            </strong>

          </div>

        </div>


        <div className="trend-chart">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={[
                {
                  name: "Start",
                  value:
                    productivity * 0.45,
                },
                {
                  name: "Activity",
                  value:
                    productivity * 0.65,
                },
                {
                  name: "Focus",
                  value:
                    productivity * 0.82,
                },
                {
                  name: "Current",
                  value: productivity,
                },
              ]}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >

              <defs>

                <linearGradient
                  id="productivityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#10b981"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="100%"
                    stopColor="#10b981"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="name"
                hide
              />

              <YAxis
                domain={[0, 100]}
                hide
              />

              <Tooltip
                contentStyle={{
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "9px",
                  fontSize: "10px",
                }}
                formatter={(value) => [
                  `${Math.round(value)}%`,
                  "Productivity",
                ]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#productivityGradient)"
                animationDuration={1300}
                dot={{
                  r: 3,
                  fill: "#10b981",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                }}
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>


        <div className="trend-bottom">

          <div>

            <span className="trend-dot"></span>

            <span>
              Current productivity
            </span>

          </div>

          <strong>
            {productivity}% efficiency
          </strong>

        </div>

      </section>

      <section className="dashboard-insights">


        <InsightCard
          icon="✓"
          title="Focused work"
          value={formatShortDuration(
            productive
          )}
          description="Time spent productively"
          type="success"
        />


        <InsightCard
          icon="◌"
          title="Idle time"
          value={formatShortDuration(
            idle
          )}
          description="Time away from activity"
          type="warning"
        />


        <InsightCard
          icon="!"
          title="Distractions"
          value={formatShortDuration(
            nonProductive
          )}
          description="Non-productive activity"
          type="danger"
        />


        <InsightCard
          icon="↗"
          title="Efficiency"
          value={`${productivity}%`}
          description="Overall productivity score"
          type="primary"
        />

      </section>

      <div className="dashboard-agent-banner">

        <div className="agent-banner-icon">
          ✦
        </div>

        <div className="agent-banner-content">

          <strong>
            Keep your desktop agent running
          </strong>

          <span>
            Track active apps, idle time and productivity
            automatically while you work.
          </span>

        </div>

        <Link
          to="/download-agent"
          className="agent-banner-button"
        >
          Manage Agent
          <span>
            →
          </span>
        </Link>

      </div>

    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  variant = "",
  description,
  progress,
  delay,
}) {
  return (
    <div
      className="dashboard-metric-card"
      style={{
        animationDelay: delay,
      }}
    >

      <div className="metric-card-top">

        <div className="metric-card-label">

          <span
            className={`metric-card-icon ${variant}`}
          >
            {icon}
          </span>

          <span>
            {label}
          </span>

        </div>

        {typeof progress === "number" && (
          <span className="metric-card-percent">
            {progress}%
          </span>
        )}

      </div>


      <strong
        className={`metric-card-value ${variant}`}
      >
        {value}
      </strong>


      <span className="metric-card-description">
        {description}
      </span>


      {typeof progress === "number" && (
        <div className="metric-card-progress">

          <div
            style={{
              width: `${progress}%`,
            }}
          ></div>

        </div>
      )}

    </div>
  );
}



function ChartLegend({
  label,
  value,
  type,
}) {
  return (
    <div className="chart-legend">

      <div className="chart-legend-label">

        <span
          className={`chart-legend-dot ${type}`}
        ></span>

        <span>
          {label}
        </span>

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function MiniStat({
  label,
  value,
  percentage,
  type,
}) {
  return (
    <div className="mini-stat">

      <div className="mini-stat-top">

        <div className="mini-stat-label">

          <span
            className={`mini-stat-dot ${type}`}
          ></span>

          {label}

        </div>

        <strong>
          {percentage}%
        </strong>

      </div>

      <div className="mini-stat-bar">

        <div
          className={type}
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

      <span className="mini-stat-value">
        {value}
      </span>

    </div>
  );
}


function InsightCard({
  icon,
  title,
  value,
  description,
  type,
}) {
  return (
    <div className="insight-card">

      <div
        className={`insight-icon ${type}`}
      >
        {icon}
      </div>

      <div className="insight-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

      <span className="insight-arrow">
        →
      </span>

    </div>
  );
}