import React, { useEffect, useState } from "react";
import { Plus, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import { Badge, PointsBadge } from "../components/Badge";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { isManagerial } from "../constants/roles";

const STATUS_FLOW = ["Pending", "In Progress", "Completed"];
const STATUS_BORDER = {
  Pending: "border-l-slate-300",
  "In Progress": "border-l-blue-400",
  Completed: "border-l-emerald-400",
};

export default function Tasks() {
  const { user, updateUserPoints } = useAuth();
  const managerial = isManagerial(user?.role);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", points: 2, assignedToId: "", dueDate: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/tasks");
    setTasks(data);
    if (managerial) {
      const { data: users } = await api.get("/users");
      setEmployees(users.filter((u) => u.role !== "ADMIN"));
    }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    const onUpdate = () => load();
    socket.on("task:updated", onUpdate);
    return () => socket.off("task:updated", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tasks", form);
      setForm({ title: "", description: "", points: 2, assignedToId: "", dueDate: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create task");
    }
  };

  const nextStatus = (current) => STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(current) + 1, 2)];

  const advanceStatus = async (task) => {
    const newStatus = nextStatus(task.status);
    const { data } = await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
    if (newStatus === "Completed" && !managerial && data.assignee?.id === user.id) {
      updateUserPoints(data.assignee.points);
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <TopBar title={managerial ? "Tasks" : "My Tasks"} subtitle={managerial ? "Create and assign work to your team" : "Complete tasks to earn points"} />
        {managerial && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm shadow-brand-200 shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <input required placeholder="Task title" value={form.title} onChange={update("title")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          <textarea placeholder="Description" value={form.description} onChange={update("description")} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Points (workload)</label>
              <select value={form.points} onChange={update("points")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value={2}>2 — Light</option>
                <option value={3}>3 — Medium</option>
                <option value={4}>4 — Heavy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Assign to</label>
              <select required value={form.assignedToId} onChange={update("assignedToId")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Select...</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Due date</label>
              <input type="date" value={form.dueDate} onChange={update("dueDate")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg">
            Create Task
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className={`bg-white border border-slate-200 border-l-4 ${STATUS_BORDER[task.status]} rounded-xl p-5 hover:shadow-md hover:shadow-slate-100 transition-shadow`}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{task.title}</h3>
              <PointsBadge points={task.points} />
            </div>
            {task.description && <p className="text-sm text-slate-500 mt-1.5">{task.description}</p>}

            <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
              {managerial ? <span>Assigned to <span className="text-slate-700 font-medium">{task.assignee?.name}</span></span> : <span>&nbsp;</span>}
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <Badge text={task.status} />
              {task.status !== "Completed" && (managerial || task.assignee?.id === user.id) && (
                <button
                  onClick={() => advanceStatus(task)}
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg"
                >
                  {task.status === "Pending" ? "Start" : "Complete"}
                  {task.status === "Pending" ? <ArrowRight size={13} /> : <CheckCircle2 size={13} />}
                </button>
              )}
              {task.status === "Completed" && <span className="text-xs font-semibold text-emerald-600">+{task.points} pts earned</span>}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
      </div>
    </div>
  );
}
