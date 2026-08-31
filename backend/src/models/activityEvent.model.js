  const { DataTypes } = require("sequelize");
  const sequelize = require("../config/db");

  const ActivityEvent = sequelize.define(
    "ActivityEvent",
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

      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "work_sessions",
          key: "id",
        },
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },

      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      application: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      domain: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      windowTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      activityState: {
        type: DataTypes.ENUM("ACTIVE", "IDLE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      category: {
        type: DataTypes.ENUM(
          "PRODUCTIVE",
          "NON_PRODUCTIVE",
          "NEUTRAL"
        ),
        allowNull: false,
        defaultValue: "NEUTRAL",
      },

      durationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "activity_events",
      underscored: true,
      timestamps: true,

      indexes: [
        { fields: ["tenant_id"] },
        { fields: ["session_id"] },
        { fields: ["user_id"] },
        { fields: ["timestamp"] },
        { fields: ["tenant_id", "user_id", "timestamp"] },
        { fields: ["session_id", "timestamp"] },
      ],
    }
  );

  module.exports = ActivityEvent;