const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// points is restricted to 2, 3, or 4 — matching the "workload" scale requested.
// completedAt is set only once, the first time a task moves to "Completed",
// which is what we use to make sure points are only ever awarded once.
const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: { isIn: [[2, 3, 4]] },
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed"),
      allowNull: false,
      defaultValue: "Pending",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

module.exports = Task;
