import { useEffect, useState } from "react";
import {
Users,
Clock3,
Activity,
Bell,
ArrowUpRight,
MoreHorizontal,
} from "lucide-react";

function Dashboard() {
const [timeData, setTimeData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchTodayTime = async () => {
try {
const token = localStorage.getItem("token");


    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/time/today",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Today Time Response:", data);

    if (!response.ok) {
      setError(data.message || "Unable to load dashboard data");
      setLoading(false);
      return;
    }

    setTimeData(data);
  } catch (error) {
    console.error("Dashboard Error:", error);
    setError("Unable to connect to the server");
  } finally {
    setLoading(false);
  }
};

fetchTodayTime();


}, []);

const formatDateTime = (dateString) => {
if (!dateString) return "-";


return new Date(dateString).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});

};

return ( <div className="space-y-6">

```
  {/* Header */}
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Dashboard
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Here's what's happening with your work today.
      </p>
    </div>

    <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
      Export Report
    </button>
  </div>

  {/* Error */}
  {error && (
    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
      {error}
    </div>
  )}

  {/* Stats */}
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

    <StatCard
      title="Tracking Status"
      value={
        loading
          ? "Loading..."
          : timeData?.isTracking
          ? "Active"
          : "Stopped"
      }
      description={
        timeData?.isTracking
          ? "Work session is active"
          : "No active session"
      }
      icon={Activity}
      positive={timeData?.isTracking}
    />

    <StatCard
      title="Tracked Time"
      value={loading ? "Loading..." : timeData?.totalHours || "0h 0m"}
      description="Today"
      icon={Clock3}
    />

    <StatCard
      title="Sessions"
      value={loading ? "..." : timeData?.sessions ?? 0}
      description="Today's sessions"
      icon={Users}
    />

    <StatCard
      title="Open Alerts"
      value="0"
      description="No alerts"
      icon={Bell}
    />

  </div>

  {/* Today's Work */}
  <div className="grid gap-6 xl:grid-cols-3">

    {/* Current Session */}
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-bold text-slate-900">
            Today's Work
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your time tracking activity for today
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Clock3 className="h-5 w-5 text-slate-700" />
        </div>

      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">
            Total Tracked
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : timeData?.totalHours || "0h 0m"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">
            Sessions
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : timeData?.sessions ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">
            Current Status
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading
              ? "..."
              : timeData?.isTracking
              ? "Active"
              : "Stopped"}
          </p>
        </div>

      </div>

      {/* Active Entry */}
      {timeData?.activeEntry && (
        <div className="mt-6 rounded-xl border border-slate-200 p-5">

          <div className="flex items-center gap-3">

            <span className="h-3 w-3 rounded-full bg-emerald-500" />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Active Work Session
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Started at{" "}
                {formatDateTime(
                  timeData.activeEntry.startTime
                )}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>

    {/* Summary */}
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="font-bold text-slate-900">
            Today's Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your work activity
          </p>
        </div>

        <MoreHorizontal className="h-5 w-5 text-slate-400" />

      </div>

      <div className="mt-7 space-y-5">

        <ProgressItem
          label="Tracked"
          value={
            loading
              ? "..."
              : timeData?.totalHours || "0h 0m"
          }
          percentage={
            timeData?.totalMinutes
              ? `${Math.min(
                  (timeData.totalMinutes / 480) * 100,
                  100
                )}%`
              : "0%"
          }
        />

        <ProgressItem
          label="Sessions"
          value={loading ? "..." : timeData?.sessions ?? 0}
          percentage={
            timeData?.sessions
              ? `${Math.min(
                  timeData.sessions * 20,
                  100
                )}%`
              : "0%"
          }
        />

      </div>

      <div className="mt-8 rounded-xl bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Tracking Status
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current work session
            </p>
          </div>

          <div className="flex items-center gap-2">

            <span
              className={`h-2.5 w-2.5 rounded-full ${
                timeData?.isTracking
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />

            <span className="text-sm font-bold text-slate-700">
              {timeData?.isTracking
                ? "Active"
                : "Stopped"}
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>

  {/* Today's Sessions */}
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

    <div className="mb-6 flex items-center justify-between">

      <div>
        <h2 className="font-bold text-slate-900">
          Today's Sessions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your recent work sessions
        </p>
      </div>

      <Clock3 className="h-5 w-5 text-slate-400" />

    </div>

    {loading ? (
      <p className="py-8 text-center text-sm text-slate-500">
        Loading sessions...
      </p>
    ) : timeData?.entries?.length > 0 ? (

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500">
              <th className="pb-3 font-medium">
                Session
              </th>

              <th className="pb-3 font-medium">
                Start
              </th>

              <th className="pb-3 font-medium">
                End
              </th>

              <th className="pb-3 font-medium">
                Duration
              </th>

              <th className="pb-3 font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>

            {timeData.entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-slate-100 last:border-0"
              >

                <td className="py-4 text-sm font-medium text-slate-900">
                  Work Session #{entry.id}
                </td>

                <td className="py-4 text-sm text-slate-500">
                  {formatDateTime(entry.startTime)}
                </td>

                <td className="py-4 text-sm text-slate-500">
                  {formatDateTime(entry.endTime)}
                </td>

                <td className="py-4 text-sm text-slate-500">
                  {entry.duration ?? 0} min
                </td>

                <td className="py-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      entry.endTime
                        ? "bg-slate-100 text-slate-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {entry.endTime
                      ? "Completed"
                      : "Active"}
                  </span>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    ) : (

      <div className="py-10 text-center">

        <Clock3 className="mx-auto h-8 w-8 text-slate-300" />

        <p className="mt-3 text-sm text-slate-500">
          No work sessions recorded today.
        </p>

      </div>

    )}

  </div>

</div>

);
}

function StatCard({
title,
value,
description,
icon: Icon,
positive,
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

  <div className="flex items-start justify-between">

    <div>

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </h2>

      <p
        className={`mt-2 text-xs font-medium ${
          positive
            ? "text-emerald-600"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>

    </div>

    <div className="rounded-xl bg-slate-100 p-3">
      <Icon className="h-5 w-5 text-slate-700" />
    </div>

  </div>

</div>


);
}

function ProgressItem({
label,
value,
percentage,
}) {
return ( <div>

  <div className="mb-2 flex items-center justify-between">

    <span className="text-sm font-medium text-slate-700">
      {label}
    </span>

    <span className="text-sm font-bold text-slate-900">
      {value}
    </span>

  </div>

  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

    <div
      style={{ width: percentage }}
      className="h-full rounded-full bg-slate-900"
    />

  </div>

</div>

);
}

export default Dashboard;
