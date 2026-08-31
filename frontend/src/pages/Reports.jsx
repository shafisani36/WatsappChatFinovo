import {
  Download,
  CalendarDays,
  Clock3,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const weeklyData = [
  {
    day: "Mon",
    tracked: 38,
    productive: 31,
  },
  {
    day: "Tue",
    tracked: 42,
    productive: 35,
  },
  {
    day: "Wed",
    tracked: 40,
    productive: 33,
  },
  {
    day: "Thu",
    tracked: 44,
    productive: 37,
  },
  {
    day: "Fri",
    tracked: 39,
    productive: 34,
  },
];

const employeeReport = [
  {
    name: "Ali Khan",
    tracked: "38h 24m",
    productive: "31h 18m",
    productivity: "81.5%",
    tasks: 18,
  },
  {
    name: "Sara Ahmed",
    tracked: "36h 42m",
    productive: "30h 11m",
    productivity: "82.2%",
    tasks: 21,
  },
  {
    name: "Usman Ali",
    tracked: "34h 18m",
    productive: "26h 44m",
    productivity: "78.0%",
    tasks: 15,
  },
  {
    name: "Hassan Raza",
    tracked: "32h 51m",
    productive: "25h 19m",
    productivity: "77.0%",
    tasks: 13,
  },
  {
    name: "Ayesha Malik",
    tracked: "40h 05m",
    productive: "34h 52m",
    productivity: "87.0%",
    tasks: 24,
  },
];

function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyze time, productivity and employee performance.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date Range
            </label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-900">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Team
            </label>

            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900">
              <option>All Teams</option>
              <option>Development</option>
              <option>Design</option>
              <option>QA</option>
              <option>Management</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Report Type
            </label>

            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900">
              <option>Productivity Report</option>
              <option>Time Report</option>
              <option>Employee Report</option>
              <option>Task Report</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Tracked
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                192h 20m
              </p>

              <p className="mt-2 text-xs text-slate-500">
                This week
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <Clock3 className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Productive Time
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                158h 24m
              </p>

              <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                8.4% increase
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Productivity
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                82.4%
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Team average
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <TrendingUp className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                24
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Across all teams
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <Users className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="font-bold text-slate-900">
            Weekly Time Report
          </h2>

          <p className="text-sm text-slate-500">
            Tracked hours compared with productive hours.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="tracked"
                name="Tracked Hours"
                fill="#0f172a"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="productive"
                name="Productive Hours"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Report */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-bold text-slate-900">
            Employee Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Productivity and tracked time by employee.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tracked
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Productive
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Productivity
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tasks
                </th>
              </tr>
            </thead>

            <tbody>
              {employeeReport.map((employee) => (
                <tr
                  key={employee.name}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {employee.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {employee.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-600">
                    {employee.tracked}
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-600">
                    {employee.productive}
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {employee.productivity}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-slate-700">
                    {employee.tasks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;