const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PasswordResetOtp = sequelize.define(
  "PasswordResetOtp",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "password_reset_otps",
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ["email"] },
      { fields: ["expires_at"] },
    ],
  }
);

module.exports = PasswordResetOtp;
