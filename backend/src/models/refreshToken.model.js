  const { DataTypes } = require("sequelize");
  const sequelize = require("../config/db");

  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users", 
          key: "id",
        },
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "companies", 
          key: "id",
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "refresh_tokens", 
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["tenant_id"] },
        { fields: ["expires_at"] },
      ],
    }
  );

  module.exports = RefreshToken;