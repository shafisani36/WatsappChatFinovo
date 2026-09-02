const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "conversations",
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

    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "conversation_participants",
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["conversation_id", "user_id"] },
      { fields: ["user_id"] },
    ],
  }
);

module.exports = ConversationParticipant;