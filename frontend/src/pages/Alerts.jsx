import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  Info,
  CircleAlert,
} from "lucide-react";

const initialAlerts = [
  {
    id: 1,
    employee: "Usman Ali",
    type: "Idle Time",
    severity: "High",
    message: "Employee has been idle for more than 30 minutes.",
    time: "10:42 AM",
    date: "Today",
    status: "Open",
  },
  {
    id: 2,
    employee: "Hassan Raza",
    type: "Unproductive Activity",
    severity: "Medium",
    message: "High amount of non-productive activity detected.",
    time: "10:25 AM",
    date: "Today",
    status: "Open",
  },
  {
    id: 3,
    employee: "Ali Khan",
    type: "Long Session",
    severity: "Low",
    message: "Work session has exceeded the configured duration.",
    time: "09:55 AM",
    date: "Today",
    status: "Open",
  },
  {
    id: 4,
    employee: "Sara Ahmed",
    type: "Idle Time",
    severity: "Medium",
    message: "Employee has been idle for more than 15 minutes.",
    time: "09:30 AM",
    date: "Today",
    status: "Resolved",
  },
  {
    id: 5,
    employee: "Ayesha Malik",
    type: "Unproductive Activity",
    severity: "Low",
    message: "Non-productive activity exceeded the configured threshold.",
    time: "09:12 AM",
    date: "Today",
    status: "Resolved",
  },
];

function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.employee.toLowerCase().includes(search.toLowerCase()) ||
      alert.type.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      severity === "All" || alert.severity === severity;

    const matchesStatus =
      status === "All" || alert.status === status;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const resolveAlert = (id) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id
          ? { ...alert, status: "Resolved" }
          : alert
      )
    );
  };

  const openCount = alerts.filter(
    (alert) => alert.status === "Open"
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.severity === "High"
  ).length;

  const resolvedCount = alerts.filter(
    (alert) => alert.status === "Resolved"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Alerts
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor productivity, idle time and other workforce alerts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Open Alerts
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {openCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <AlertTriangle className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                High Priority
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {highCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <ShieldAlert className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Resolved
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {resolvedCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <CheckCircle2 className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or alert..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>

          {/* Severity */}
          <div className="w-full xl:w-52">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Severity
            </label>

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Status */}
          <div className="w-full xl:w-52">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option>All</option>
              <option>Open</option>
              <option>Resolved</option>
            </select>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-bold text-slate-900">
            Recent Alerts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review and resolve workforce monitoring alerts.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-6 transition hover:bg-slate-50"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Left */}
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      alert.severity === "High"
                        ? "bg-slate-900 text-white"
                        : alert.severity === "Medium"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {alert.severity === "High" ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : alert.severity === "Medium" ? (
                      <CircleAlert className="h-5 w-5" />
                    ) : (
                      <Info className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {alert.type}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          alert.severity === "High"
                            ? "bg-slate-900 text-white"
                            : alert.severity === "Medium"
                              ? "bg-slate-200 text-slate-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {alert.severity}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          alert.status === "Open"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {alert.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        {alert.employee}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {alert.time}
                      </span>

                      <span>{alert.date}</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                {alert.status === "Open" && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Resolve
                  </button>
                )}

                {alert.status === "Resolved" && (
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {filteredAlerts.length === 0 && (
          <div className="py-16 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-900">
              No alerts found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;