import { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Clock3,
} from "lucide-react";

const employeesData = [
  {
    id: 1,
    name: "Ali Khan",
    email: "ali.khan@finovo.com",
    role: "Frontend Developer",
    team: "Development",
    status: "Active",
    hours: "06h 42m",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@finovo.com",
    role: "Backend Developer",
    team: "Development",
    status: "Active",
    hours: "05h 18m",
  },
  {
    id: 3,
    name: "Usman Ali",
    email: "usman.ali@finovo.com",
    role: "QA Engineer",
    team: "QA",
    status: "Idle",
    hours: "04h 51m",
  },
  {
    id: 4,
    name: "Hassan Raza",
    email: "hassan.raza@finovo.com",
    role: "UI/UX Designer",
    team: "Design",
    status: "Offline",
    hours: "03h 22m",
  },
  {
    id: 5,
    name: "Ayesha Malik",
    email: "ayesha.malik@finovo.com",
    role: "Project Manager",
    team: "Management",
    status: "Active",
    hours: "07h 05m",
  },
];

function Employees() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredEmployees = employeesData.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.role.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeEmployees = employeesData.filter(
    (employee) => employee.status === "Active"
  ).length;

  const idleEmployees = employeesData.filter(
    (employee) => employee.status === "Idle"
  ).length;

  const offlineEmployees = employeesData.filter(
    (employee) => employee.status === "Offline"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your employees, teams and work status.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Plus className="h-5 w-5" />
          Add Employee
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {employeesData.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <Users className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeEmployees}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Idle
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {idleEmployees}
              </p>
            </div>

            <div className="rounded-xl bg-yellow-50 p-3">
              <Clock3 className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Offline
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {offlineEmployees}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <UserX className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Idle">Idle</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Team
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Today
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    {/* Employee */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {employee.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {employee.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {employee.role}
                    </td>

                    {/* Team */}
                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {employee.team}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            employee.status === "Active"
                              ? "bg-green-500"
                              : employee.status === "Idle"
                              ? "bg-yellow-500"
                              : "bg-slate-400"
                          }`}
                        />

                        <span className="text-sm text-slate-600">
                          {employee.status}
                        </span>
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {employee.hours}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 text-right">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredEmployees.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {employeesData.length}
            </span>{" "}
            employees
          </p>
        </div>
      </div>
    </div>
  );
}

export default Employees;