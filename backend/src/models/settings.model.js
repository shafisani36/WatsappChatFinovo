const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Settings = sequelize.define(
  "Settings",
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
      unique: true,
    },
    workingHoursPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8,
      comment: "Standard working hours per day",
    },
    workingDaysPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: "Number of working days per week",
    },
    idleThresholdSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 300,
      comment: "Seconds of inactivity before marking as IDLE (default 5 minutes)",
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "UTC",
      comment: "Company timezone for reports",
    },
  },
  {
    tableName: "settings",
    underscored: true,
    timestamps: true,
  }
);

module.exports = Settings;