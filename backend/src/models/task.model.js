const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
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

    assignedToId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "tasks",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["assigned_to_id"] },
      { fields: ["status"] },
      { fields: ["tenant_id", "assigned_to_id"] },
      { fields: ["tenant_id", "status"] },
    ],
  }
);

module.exports = Task;
