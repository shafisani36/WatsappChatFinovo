const express = require("express");
const { Task, User } = require("../models");
const { protect, authorize } = require("../middleware/auth");
const { MANAGERIAL_ROLES } = require("../config/roles");
const sequelize = require("../config/db");

const router = express.Router();
router.use(protect);

const isManagerial = (role) => MANAGERIAL_ROLES.includes(role);

// GET /tasks — managerial roles see everything, working roles see only their own
router.get("/", async (req, res) => {
  const where = {};
  if (!isManagerial(req.user.role)) {
    where.assignedToId = req.user.id;
  }
  if (req.query.status) where.status = req.query.status;

  const tasks = await Task.findAll({
    where,
    include: [
      { model: User, as: "assignee", attributes: ["id", "name", "role"] },
      { model: User, as: "creator", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(tasks);
});

// POST /tasks — ADMIN, MANAGER, PROJECT_COORDINATOR only
router.post("/", authorize(...MANAGERIAL_ROLES), async (req, res) => {
  const { title, description, points, assignedToId, dueDate } = req.body;
  if (!title || !assignedToId) {
    return res.status(400).json({ message: "title and assignedToId are required" });
  }
  if (points && ![2, 3, 4].includes(Number(points))) {
    return res.status(400).json({ message: "points must be 2, 3, or 4" });
  }

  const assignee = await User.findByPk(assignedToId);
  if (!assignee) return res.status(404).json({ message: "Assignee not found" });

  const task = await Task.create({
    title,
    description,
    points: points || 2,
    assignedToId,
    createdById: req.user.id,
    dueDate: dueDate || null,
  });

  const withAssignee = await Task.findByPk(task.id, {
    include: [{ model: User, as: "assignee", attributes: ["id", "name", "role"] }],
  });

  req.app.get("io")?.emit("task:updated", withAssignee);
  res.status(201).json(withAssignee);
});

// PATCH /tasks/:id/status — points are awarded exactly once, on the
// transition INTO "Completed", guarded by a DB transaction.
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Task not found" });
    }

    if (!isManagerial(req.user.role) && task.assignedToId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: "This task is not assigned to you" });
    }

    const wasAlreadyCompleted = task.status === "Completed";
    task.status = status;

    if (status === "Completed" && !wasAlreadyCompleted) {
      task.completedAt = new Date();
      await User.increment("points", { by: task.points, where: { id: task.assignedToId }, transaction: t });
    }

    await task.save({ transaction: t });
    await t.commit();

    const updated = await Task.findByPk(task.id, {
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "role", "points"] },
        { model: User, as: "creator", attributes: ["id", "name"] },
      ],
    });

    const io = req.app.get("io");
    io?.emit("task:updated", updated);
    if (status === "Completed" && !wasAlreadyCompleted) {
      io?.emit("leaderboard:updated");
    }

    res.json(updated);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error updating task status" });
  }
});

// PATCH /tasks/:id — managerial roles edit task details (not status)
router.patch("/:id", authorize(...MANAGERIAL_ROLES), async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const allowed = ["title", "description", "points", "assignedToId", "dueDate"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) task[key] = req.body[key];
  });
  await task.save();

  req.app.get("io")?.emit("task:updated", task);
  res.json(task);
});

module.exports = router;
