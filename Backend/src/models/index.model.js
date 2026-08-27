const sequelize = require("../config/db");
const Company = require("./company.model");
const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");

Company.hasMany(User, { foreignKey: "tenantId", onDelete: "CASCADE" });
User.belongsTo(Company, { foreignKey: "tenantId" });

Company.hasMany(RefreshToken, { foreignKey: "tenantId", onDelete: "CASCADE" });
RefreshToken.belongsTo(Company, { foreignKey: "tenantId" });

User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  Company,
  User,
  RefreshToken,
};