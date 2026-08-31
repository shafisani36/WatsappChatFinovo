const { Task, User } = require("../models/index.model");

const MANAGERIAL_ROLES = ["COMPANY_ADMIN", "MANAGER"];
const isManagerial = (role) => MANAGERIAL_ROLES.includes(role);

class TaskService {
  async getTasks(tenantId, requester, statusFilter) {
    const where = { tenantId };

    if (!isManagerial(requester.role)) {
      where.assignedToId = requester.id;
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    return Task.findAll({
      where,
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "role"] },
        { model: User, as: "creator", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async createTask(tenantId, createdById, { title, description, points, assignedToId, dueDate }) {
    if (!title || !assignedToId) {
      throw new Error("TITLE_AND_ASSIGNEE_REQUIRED");
    }

    if (points && ![2, 3, 4].includes(Number(points))) {
      throw new Error("INVALID_POINTS");
    }

    const assignee = await User.findOne({ where: { id: assignedToId, tenantId } });
    if (!assignee) {
      throw new Error("ASSIGNEE_NOT_FOUND");
    }

    const task = await Task.create({
      tenantId,
      title,
      description: description || "",
      points: points || 2,
      assignedToId,
      createdById,
      dueDate: dueDate || null,
    });

    return Task.findByPk(task.id, {
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "role"] },
        { model: User, as: "creator", attributes: ["id", "name"] },
      ],
    });
  }

  async updateTaskStatus(tenantId, requester, taskId, status) {
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      throw new Error("INVALID_STATUS");
    }

    const transaction = await Task.sequelize.transaction();

    try {
      const task = await Task.findOne({
        where: { id: taskId, tenantId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!task) {
        await transaction.rollback();
        throw new Error("TASK_NOT_FOUND");
      }

      if (!isManagerial(requester.role) && task.assignedToId !== requester.id) {
        await transaction.rollback();
        throw new Error("NOT_ASSIGNED_TO_YOU");
      }

      const wasAlreadyCompleted = task.status === "Completed";
      task.status = status;

      if (status === "Completed" && !wasAlreadyCompleted) {
        task.completedAt = new Date();
        await User.increment("points", {
          by: task.points,
          where: { id: task.assignedToId, tenantId },
          transaction,
        });
      }

      await task.save({ transaction });
      await transaction.commit();

      return Task.findByPk(task.id, {
        include: [
          { model: User, as: "assignee", attributes: ["id", "name", "role", "points"] },
          { model: User, as: "creator", attributes: ["id", "name"] },
        ],
      });
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  async updateTask(tenantId, taskId, updates) {
    const task = await Task.findOne({ where: { id: taskId, tenantId } });
    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }

    const allowed = ["title", "description", "points", "assignedToId", "dueDate"];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) task[key] = updates[key];
    });

    await task.save();

    return Task.findByPk(task.id, {
      include: [{ model: User, as: "assignee", attributes: ["id", "name", "role"] }],
    });
  }

  async getAssignableUsers(tenantId) {
    return User.findAll({
      where: { tenantId },
      attributes: ["id", "name", "role", "points"],
      order: [["name", "ASC"]],
    });
  }
}

module.exports = new TaskService();
