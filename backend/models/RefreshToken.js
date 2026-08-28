const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Instead of trusting a refresh token forever just because it's signed,
// we store a HASH of every issued refresh token here. This lets us:
//   - revoke a specific token on logout
//   - detect reuse of an old, already-rotated token
//   - see immediately in the database which sessions are active
// We never store the raw token, only its SHA-256 hash (see utils/tokenHash.js).
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
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["expiresAt"] }],
  }
);

module.exports = RefreshToken;
