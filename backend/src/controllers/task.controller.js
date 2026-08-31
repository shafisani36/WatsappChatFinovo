const taskService = require("../services/task.service");

const getTasks = async (req, res) => {
  try {
    const { tenantId, id, role } = req.user;
    const tasks = await taskService.getTasks(tenantId, { id, role }, req.query.status);

    res.status(200).json({
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const task = await taskService.createTask(tenantId, id, req.body);

    res.status(201).json({
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    if (error.message === "TITLE_AND_ASSIGNEE_REQUIRED") {
      return res.status(400).json({ message: "Title and assignedToId are required" });
    }
    if (error.message === "INVALID_POINTS") {
      return res.status(400).json({ message: "Points must be 2, 3, or 4" });
    }
    if (error.message === "ASSIGNEE_NOT_FOUND") {
      return res.status(404).json({ message: "Assignee not found" });
    }
    res.status(500).json({
      message: "Error creating task",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { tenantId, id, role } = req.user;
    const task = await taskService.updateTaskStatus(tenantId, { id, role }, req.params.id, req.body.status);

    res.status(200).json({
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    if (error.message === "INVALID_STATUS") {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({ message: "Task not found" });
    }
    if (error.message === "NOT_ASSIGNED_TO_YOU") {
      return res.status(403).json({ message: "This task is not assigned to you" });
    }
    res.status(500).json({
      message: "Error updating task status",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const task = await taskService.updateTask(tenantId, req.params.id, req.body);

    res.status(200).json({
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    if (error.message === "TASK_NOT_FOUND") {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(500).json({
      message: "Error updating task",
      error: error.message,
    });
  }
};

const getAssignableUsers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const users = await taskService.getAssignableUsers(tenantId);

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  getAssignableUsers,
};
