import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const STATUS_FLOW = ["Pending", "In Progress", "Completed"];

const statusBadgeClass = (status) => {
  if (status === "Completed") return "badge badge-active";
  if (status === "In Progress") return "badge badge-paused";
  return "badge badge-completed";
};

const Tasks = () => {
  const { user, isManager, fetchUser } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    points: 2,
    assignedToId: "",
    dueDate: "",
  });

  const loadTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data.data);
    } catch (error) {
      toast.error("Could not load tasks");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignees = async () => {
    try {
      const response = await api.get("/tasks/assignable-users");
      setAssignees(response.data.data);
    } catch (error) {
      // Non-managers aren't allowed to see this list; safe to ignore.
    }
  };

  useEffect(() => {
    loadTasks();
    if (isManager) {
      loadAssignees();
    }

    const poll = setInterval(loadTasks, 10000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManager]);

  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const submitTask = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/tasks", form);
      toast.success("Task created");
      setForm({ title: "", description: "", points: 2, assignedToId: "", dueDate: "" });
      setShowForm(false);
      loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create task");
    } finally {
      setSubmitting(false);
    }
  };

  const nextStatus = (current) => STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(current) + 1, 2)];

  const advanceStatus = async (task) => {
    try {
      const response = await api.patch(`/tasks/${task.id}/status`, {
        status: nextStatus(task.status),
      });

      if (response.data.data.status === "Completed") {
        toast.success(`+${task.points} points earned!`);
      }

      if (task.assignee?.id === user.id) {
        fetchUser();
      }

      loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task");
    }
  };

  return (
    <div className="team-page">
      <div className="page-header animate-in">
        <div>
          <h1>{isManager ? "Tasks" : "My Tasks"}</h1>
          <p>{isManager ? "Create and assign work to your team" : "Complete tasks to earn points"}</p>
        </div>

        {isManager && (
          <button className="auth-button" style={{ width: "auto", padding: "10px 18px" }} onClick={() => setShowForm((s) => !s)}>
            + New Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitTask} className="dashboard-card animate-card" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label>Task title</label>
            <input required placeholder="e.g. Fix login bug" value={form.title} onChange={updateField("title")} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input placeholder="Optional details" value={form.description} onChange={updateField("description")} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="form-group">
              <label>Points (workload)</label>
              <select value={form.points} onChange={updateField("points")}>
                <option value={2}>2 — Light</option>
                <option value={3}>3 — Medium</option>
                <option value={4}>4 — Heavy</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign to</label>
              <select required value={form.assignedToId} onChange={updateField("assignedToId")}>
                <option value="">Select...</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due date</label>
              <input type="date" value={form.dueDate} onChange={updateField("dueDate")} />
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading-card">
          <div className="loader-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-card animate-card">
          <div className="empty-icon">▤</div>
          <h3>No tasks yet</h3>
          <p>{isManager ? "Create a task to assign work to your team." : "You have no tasks assigned right now."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {tasks.map((task) => (
            <div key={task.id} className="dashboard-card animate-card">
              <div className="card-header">
                <h2>{task.title}</h2>
                <span className="badge badge-paused">{task.points} pts</span>
              </div>

              {task.description && <p style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 12 }}>{task.description}</p>}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
                {isManager && <span>Assigned to <strong style={{ color: "var(--text)" }}>{task.assignee?.name}</strong></span>}
                {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
                <span className={statusBadgeClass(task.status)}>{task.status}</span>

                {task.status !== "Completed" && (isManager || task.assignee?.id === user.id) && (
                  <button className="refresh-button" onClick={() => advanceStatus(task)}>
                    {task.status === "Pending" ? "Start" : "Complete"}
                  </button>
                )}

                {task.status === "Completed" && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)" }}>+{task.points} pts earned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
