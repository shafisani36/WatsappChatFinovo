import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  X,
  Calendar,
  User,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Dashboard UI Development",
    description: "Complete the management dashboard interface.",
    employee: "Ali Khan",
    priority: "High",
    status: "In Progress",
    dueDate: "Aug 30, 2026",
  },
  {
    id: 2,
    title: "API Integration",
    description: "Connect frontend with backend APIs.",
    employee: "Sara Ahmed",
    priority: "High",
    status: "In Progress",
    dueDate: "Sep 02, 2026",
  },
  {
    id: 3,
    title: "Application Testing",
    description: "Test all major application modules.",
    employee: "Usman Ali",
    priority: "Medium",
    status: "Pending",
    dueDate: "Sep 05, 2026",
  },
  {
    id: 4,
    title: "Reports Design",
    description: "Create reports and analytics interface.",
    employee: "Hassan Raza",
    priority: "Low",
    status: "Completed",
    dueDate: "Aug 28, 2026",
  },
];

function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employee: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    return (
      task.title.toLowerCase().includes(searchText) ||
      task.employee.toLowerCase().includes(searchText) ||
      task.status.toLowerCase().includes(searchText)
    );
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTask = (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now(),
      ...formData,
    };

    setTasks([...tasks, newTask]);

    setFormData({
      title: "",
      description: "",
      employee: "",
      priority: "Medium",
      status: "Pending",
      dueDate: "",
    });

    setShowModal(false);
  };

  const priorityStyles = {
    High: "bg-red-50 text-red-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
  };

  const statusStyles = {
    Pending: "bg-slate-100 text-slate-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Completed: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, assign and manage your team's work.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Total Tasks
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {tasks.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            In Progress
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {
              tasks.filter(
                (task) => task.status === "In Progress"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Pending
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {
              tasks.filter(
                (task) => task.status === "Pending"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Completed
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {
              tasks.filter(
                (task) => task.status === "Completed"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4">
          <Search className="h-5 w-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search tasks, employees or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 text-sm outline-none"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-xl bg-slate-100 p-3">
                <ClipboardList className="h-5 w-5 text-slate-700" />
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}
              >
                {task.priority}
              </span>
            </div>

            <h3 className="mt-5 font-bold text-slate-900">
              {task.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {task.description}
            </p>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4 text-slate-400" />
                {task.employee}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                {task.dueDate}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}
              >
                {task.status}
              </span>

              <button className="text-sm font-semibold text-slate-900 hover:underline">
                View Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-900">
            No tasks found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try searching for another task.
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create New Task
                </h2>

                <p className="text-sm text-slate-500">
                  Assign work to a team member.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter task title"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe the task..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assign Employee
                </label>

                <input
                  type="text"
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  required
                  placeholder="Employee name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;