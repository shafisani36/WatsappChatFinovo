const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WorkSession = sequelize.define(
  "WorkSession",
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

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    taskId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "PAUSED",
        "COMPLETED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    totalSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    workingSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    idleSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    nonProductiveSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    pausedSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    deviceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "work_sessions",
    underscored: true,
    timestamps: true,

    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["user_id"] },
      { fields: ["status"] },
      { fields: ["started_at"] },
      { fields: ["ended_at"] },
      {
        fields: [
          "tenant_id",
          "user_id",
          "status",
        ],
      },
      {
        fields: [
          "tenant_id",
          "user_id",
          "started_at",
        ],
      },
    ],

    hooks: {
      beforeCreate: async (
        session,
        options
      ) => {
        const existing =
          await WorkSession.findOne({
            where: {
              userId: session.userId,
              tenantId: session.tenantId,
              status: "ACTIVE",
            },
            transaction:
              options.transaction,
          });

        if (existing) {
          throw new Error(
            "Employee already has an active session"
          );
        }
      },
    },
  }
);

module.exports = WorkSession;