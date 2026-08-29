const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("COMPANY_ADMIN", "MANAGER", "EMPLOYEE"),
      defaultValue: "EMPLOYEE",
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users", 
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["tenant_id", "email"],
      },
      {
        unique: true,
        fields: ["tenant_id", "username"],
      },
    ],
  }
);

module.exports = User;