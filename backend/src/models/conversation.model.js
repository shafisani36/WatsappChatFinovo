const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Conversation = sequelize.define(
  "Conversation",
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

    type: {
      type: DataTypes.ENUM("DIRECT", "GROUP"),
      allowNull: false,
      defaultValue: "DIRECT",
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "conversations",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["tenant_id", "type"] },
    ],
  }
);

module.exports = Conversation;