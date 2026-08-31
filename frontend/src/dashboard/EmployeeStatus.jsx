const employees = [
  {
    name: "Ali Khan",
    task: "Dashboard UI",
    status: "Active",
    time: "06:42",
  },
  {
    name: "Sara Ahmed",
    task: "API Integration",
    status: "Active",
    time: "05:18",
  },
  {
    name: "Usman Ali",
    task: "Testing",
    status: "Idle",
    time: "04:51",
  },
  {
    name: "Hassan Raza",
    task: "Frontend",
    status: "Offline",
    time: "03:22",
  },
];

function EmployeeStatus() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="font-bold text-slate-900">
          Live Employees
        </h2>

        <p className="text-sm text-slate-500">
          Current team status
        </p>
      </div>

      <div className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
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
                  {employee.task}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700">
                {employee.time}
              </p>

              <p className="text-xs text-slate-500">
                {employee.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeStatus;