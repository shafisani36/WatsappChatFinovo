import { useState } from "react";
import {
  CalendarDays,
  Search,
  Filter,
  Monitor,
  Clock3,
  Maximize2,
} from "lucide-react";

const screenshots = [
  {
    id: 1,
    employee: "Ali Khan",
    task: "Dashboard Development",
    time: "10:42 AM",
    date: "Today",
    activity: "Active",
  },
  {
    id: 2,
    employee: "Sara Ahmed",
    task: "API Integration",
    time: "10:30 AM",
    date: "Today",
    activity: "Active",
  },
  {
    id: 3,
    employee: "Usman Ali",
    task: "Testing",
    time: "10:18 AM",
    date: "Today",
    activity: "Idle",
  },
  {
    id: 4,
    employee: "Hassan Raza",
    task: "Frontend Development",
    time: "09:55 AM",
    date: "Today",
    activity: "Active",
  },
  {
    id: 5,
    employee: "Ayesha Malik",
    task: "UI Design",
    time: "09:40 AM",
    date: "Today",
    activity: "Active",
  },
  {
    id: 6,
    employee: "Ali Khan",
    task: "Dashboard Development",
    time: "09:25 AM",
    date: "Today",
    activity: "Active",
  },
];

function Screenshots() {
  const [search, setSearch] = useState("");

  const filteredScreenshots = screenshots.filter((item) =>
    item.employee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Screenshots
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review employee screenshots captured during tracked work.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Employee
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date
            </label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-900">
                <option>Today</option>
                <option>Yesterday</option>
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
          </div>

          {/* Task */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Task
            </label>

            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900">
              <option>All Tasks</option>
              <option>Dashboard Development</option>
              <option>API Integration</option>
              <option>Testing</option>
              <option>Frontend Development</option>
            </select>
          </div>

          {/* Filter Button */}
          <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {filteredScreenshots.length} Screenshots
          </p>

          <p className="text-xs text-slate-500">
            Captured today
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock3 className="h-4 w-4" />
          Auto captured during tracked sessions
        </div>
      </div>

      {/* Screenshot Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredScreenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            {/* Screenshot Preview */}
            <div className="group relative aspect-video overflow-hidden bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-950 p-5">
                <div className="h-full rounded-lg border border-slate-600 bg-slate-800/80 p-3">
                  <div className="flex items-center gap-2 border-b border-slate-600 pb-3">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    <div className="h-2 w-16 rounded bg-slate-500" />
                    <div className="ml-auto h-2 w-8 rounded bg-slate-600" />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-16 rounded bg-slate-700" />
                    <div className="h-16 rounded bg-slate-700" />
                    <div className="h-16 rounded bg-slate-700" />
                  </div>

                  <div className="mt-3 h-3 w-3/4 rounded bg-slate-700" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-700" />
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/40 group-hover:opacity-100">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>

              {/* Activity */}
              <div className="absolute right-3 top-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    screenshot.activity === "Active"
                      ? "bg-white text-slate-900"
                      : "bg-slate-500 text-white"
                  }`}
                >
                  {screenshot.activity}
                </span>
              </div>
            </div>

            {/* Information */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {screenshot.employee
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {screenshot.employee}
                    </p>

                    <p className="text-xs text-slate-500">
                      {screenshot.task}
                    </p>
                  </div>
                </div>

                <Monitor className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Captured
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {screenshot.time}
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  {screenshot.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredScreenshots.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Monitor className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-900">
            No screenshots found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try searching for another employee.
          </p>
        </div>
      )}
    </div>
  );
}

export default Screenshots;