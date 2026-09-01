import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import "../assets/styles/task.css";

const STATUS_FLOW = ["Pending", "In Progress", "Completed"];

const statusBadgeClass = (status) => {
  if (status === "Completed") return "task-status completed";
  if (status === "In Progress") return "task-status progress";
  return "task-status pending";
};

const statusIcon = (status) => {
  if (status === "Completed") return "✓";
  if (status === "In Progress") return "◷";
  return "○";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getPointsClass = (points) => {
  if (Number(points) >= 4) return "task-points heavy";
  if (Number(points) >= 3) return "task-points medium";
  return "task-points light";
};

const getDueDateState = (dueDate, status) => {
  if (!dueDate || status === "Completed") return "";

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const difference = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (difference < 0) return "overdue";
  if (difference === 0) return "today";
  if (difference <= 2) return "soon";

  return "";
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
    }
  };

  useEffect(() => {
    loadTasks();

    if (isManager) {
      loadAssignees();
    }

    const poll = setInterval(loadTasks, 10000);

    return () => clearInterval(poll);

  }, [isManager]);

  const updateField = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const submitTask = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/tasks", form);

      toast.success("Task created");

      setForm({
        title: "",
        description: "",
        points: 2,
        assignedToId: "",
        dueDate: "",
      });

      setShowForm(false);
      loadTasks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not create task"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const nextStatus = (current) =>
    STATUS_FLOW[
      Math.min(STATUS_FLOW.indexOf(current) + 1, 2)
    ];

  const advanceStatus = async (task) => {
    try {
      const response = await api.patch(
        `/tasks/${task.id}/status`,
        {
          status: nextStatus(task.status),
        }
      );

      if (response.data.data.status === "Completed") {
        toast.success(`+${task.points} points earned!`);
      }

      if (task.assignee?.id === user.id) {
        fetchUser();
      }

      loadTasks();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update task"
      );
    }
  };

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const completionPercentage =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  return (
    <div className="tasks-page">

      

      <div className="tasks-header animate-in">
        <div className="tasks-heading">
          <div className="tasks-title-line">


            <div>
              <div className="tasks-title-row">
                <h1>
                  {isManager ? "Tasks" : "My Tasks"}
                </h1>
              </div>

              <p>
                {isManager
                  ? "Create, assign and track your team's work"
                  : "Stay on top of your work and earn points"}
              </p>
            </div>
          </div>
        </div>

        {isManager && (
          <button
            className={`tasks-new-button ${
              showForm ? "active" : ""
            }`}
            onClick={() =>
              setShowForm((current) => !current)
            }
          >
            <span className="tasks-new-icon">
              {showForm ? "×" : "+"}
            </span>

            {showForm ? "Close Form" : "New Task"}
          </button>
        )}
      </div>

      {!loading && tasks.length > 0 && (
        <div className="tasks-overview animate-card">

          <div className="task-overview-card">
            <div className="task-overview-icon total">
              ▤
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
            </div>
          </div>

          <div className="task-overview-card">
            <div className="task-overview-icon pending">
              ○
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="task-overview-card">
            <div className="task-overview-icon progress">
              ◷
            </div>

            <div>
              <span>In Progress</span>
              <strong>{inProgressCount}</strong>
            </div>
          </div>

          <div className="task-overview-card">
            <div className="task-overview-icon completed">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </div>
          </div>

          <div className="task-progress-card">
            <div className="task-progress-top">
              <span>Completion</span>
              <strong>{completionPercentage}%</strong>
            </div>

            <div className="task-progress-track">
              <div
                className="task-progress-fill"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>

            <small>
              {completedCount} of {tasks.length} tasks completed
            </small>
          </div>

        </div>
      )}


      {showForm && isManager && (
        <form
          onSubmit={submitTask}
          className="tasks-create-card animate-card"
        >
          <div className="tasks-create-header">
            <div>
              <span className="section-kicker">
                NEW WORK ITEM
              </span>

              <h2>Create a new task</h2>

              <p>
                Assign work to a team member and set its
                workload.
              </p>
            </div>

            <div className="tasks-create-icon">
              +
            </div>
          </div>

          <div className="tasks-form-grid">

            <div className="form-group task-form-title">
              <label>Task title</label>

              <input
                required
                placeholder="e.g. Fix login bug"
                value={form.title}
                onChange={updateField("title")}
              />
            </div>

            <div className="form-group task-form-description">
              <label>Description</label>

              <input
                placeholder="Optional details about this task"
                value={form.description}
                onChange={updateField("description")}
              />
            </div>

            <div className="form-group">
              <label>Points</label>

              <select
                value={form.points}
                onChange={updateField("points")}
              >
                <option value={2}>
                  2 — Light
                </option>

                <option value={3}>
                  3 — Medium
                </option>

                <option value={4}>
                  4 — Heavy
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign to</label>

              <select
                required
                value={form.assignedToId}
                onChange={updateField("assignedToId")}
              >
                <option value="">
                  Select team member...
                </option>

                {assignees.map((assignee) => (
                  <option
                    key={assignee.id}
                    value={assignee.id}
                  >
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due date</label>

              <input
                type="date"
                value={form.dueDate}
                onChange={updateField("dueDate")}
              />
            </div>

          </div>

          <div className="tasks-form-footer">
            <p>
              <span>✦</span>
              You can update the task status after creation.
            </p>

            <button
              className="tasks-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  Create Task
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="tasks-loading">
          <div className="tasks-loader">
            <div></div>
          </div>

          <strong>Loading tasks...</strong>

          <p>
            Getting the latest work items
          </p>
        </div>
      ) : tasks.length === 0 ? (


        <div className="tasks-empty animate-card">
          <div className="tasks-empty-icon">
            ✓
          </div>

          <h3>No tasks yet</h3>

          <p>
            {isManager
              ? "Create a task to assign work to your team."
              : "You have no tasks assigned right now."}
          </p>

          {isManager && (
            <button
              className="tasks-empty-button"
              onClick={() => setShowForm(true)}
            >
              + Create your first task
            </button>
          )}
        </div>

      ) : (


        <div className="tasks-section animate-card">

          <div className="tasks-section-header">
            <div>
              <span className="section-kicker">
                WORK ITEMS
              </span>

              <h2>
                {isManager
                  ? "Team tasks"
                  : "Your assigned tasks"}
              </h2>

              <p>
                {isManager
                  ? "Monitor progress across your team."
                  : "Complete your tasks and keep your progress moving."}
              </p>
            </div>

            <div className="tasks-count-badge">
              <strong>{tasks.length}</strong>
              <span>
                {tasks.length === 1
                  ? "task"
                  : "tasks"}
              </span>
            </div>
          </div>

          <div className="tasks-grid">

            {tasks.map((task, index) => {
              const dueState = getDueDateState(
                task.dueDate,
                task.status
              );

              return (
                <div
                  key={task.id}
                  className="task-card animate-card"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >


                  <div className="task-card-top">

                    <div
                      className={getPointsClass(
                        task.points
                      )}
                    >
                      <span>✦</span>
                      {task.points} pts
                    </div>

                    <span
                      className={statusBadgeClass(
                        task.status
                      )}
                    >
                      <span className="task-status-icon">
                        {statusIcon(task.status)}
                      </span>

                      {task.status}
                    </span>

                  </div>


                  <div className="task-card-content">

                    <h3>{task.title}</h3>

                    {task.description ? (
                      <p>
                        {task.description}
                      </p>
                    ) : (
                      <p className="task-no-description">
                        No description provided
                      </p>
                    )}

                  </div>


                  <div className="task-meta">

                    {isManager && (
                      <div className="task-assignee">

                        <div className="task-avatar">
                          {getInitials(
                            task.assignee?.name
                          )}
                        </div>

                        <div>
                          <span>Assigned to</span>

                          <strong>
                            {task.assignee?.name ||
                              "Unassigned"}
                          </strong>
                        </div>

                      </div>
                    )}

                    {task.dueDate && (
                      <div
                        className={`task-due-date ${dueState}`}
                      >
                        <span className="task-meta-icon">
                          ◷
                        </span>

                        <div>
                          <span>Due date</span>

                          <strong>
                            {new Date(
                              task.dueDate
                            ).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </strong>
                        </div>
                      </div>
                    )}

                  </div>


                  <div className="task-status-progress">

                    <div className="task-status-line">

                      <span
                        className={
                          task.status !== "Pending"
                            ? "done"
                            : ""
                        }
                      >
                        <i></i>
                        Pending
                      </span>

                      <div
                        className={
                          task.status ===
                            "In Progress" ||
                          task.status ===
                            "Completed"
                            ? "filled"
                            : ""
                        }
                      ></div>

                      <span
                        className={
                          task.status ===
                            "In Progress" ||
                          task.status ===
                            "Completed"
                            ? "done"
                            : ""
                        }
                      >
                        <i></i>
                        In Progress
                      </span>

                      <div
                        className={
                          task.status === "Completed"
                            ? "filled"
                            : ""
                        }
                      ></div>

                      <span
                        className={
                          task.status === "Completed"
                            ? "done"
                            : ""
                        }
                      >
                        <i></i>
                        Completed
                      </span>

                    </div>

                  </div>


                  <div className="task-card-footer">

                    {task.status !== "Completed" &&
                      (isManager ||
                        task.assignee?.id ===
                          user.id) && (
                        <button
                          className="task-action-button"
                          onClick={() =>
                            advanceStatus(task)
                          }
                        >
                          <span>
                            {task.status === "Pending"
                              ? "Start Task"
                              : "Complete Task"}
                          </span>

                          <span className="task-action-arrow">
                            →
                          </span>
                        </button>
                      )}

                    {task.status === "Completed" && (
                      <div className="task-completed-message">
                        <span>✓</span>

                        <strong>
                          +{task.points} pts earned
                        </strong>
                      </div>
                    )}

                    {task.status !== "Completed" &&
                      !(
                        isManager ||
                        task.assignee?.id === user.id
                      ) && (
                        <span className="task-view-only">
                          Waiting for assignee
                        </span>
                      )}

                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="tasks-tip animate-card">

          <div className="tasks-tip-icon">
            ✦
          </div>

          <div>
            <strong>
              Keep your work moving
            </strong>

            <p>
              {isManager
                ? "Use task points to communicate workload and monitor team progress."
                : "Complete assigned tasks to increase your points and keep your progress on track."}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default Tasks;