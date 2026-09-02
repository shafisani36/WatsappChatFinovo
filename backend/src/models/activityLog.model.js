const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "companies", key: "id" },
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    windowTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    runningApplications: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    isIdle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    category: {
      type: DataTypes.ENUM("PRODUCTIVE", "NON_PRODUCTIVE", "UNCATEGORIZED"),
      defaultValue: "PRODUCTIVE",
    },
  },
  {
    tableName: "activity_logs",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["tenant_id"] },
      { fields: ["created_at"] },
    ],
  }
);

module.exports = ActivityLog;