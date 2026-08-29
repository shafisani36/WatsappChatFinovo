const sequelize = require("../config/db");
const Company = require("./company.model");
const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");
const WorkSession = require("./workSession.model");
const ActivityEvent = require("./activityEvent.model");
const Settings = require("./settings.model");

Company.hasMany(User, { foreignKey: "tenantId", onDelete: "CASCADE" });
User.belongsTo(Company, { foreignKey: "tenantId" });

Company.hasMany(RefreshToken, { foreignKey: "tenantId", onDelete: "CASCADE" });
RefreshToken.belongsTo(Company, { foreignKey: "tenantId" });

Company.hasMany(WorkSession, { foreignKey: "tenantId", onDelete: "CASCADE" });
WorkSession.belongsTo(Company, { foreignKey: "tenantId" });

Company.hasMany(ActivityEvent, { foreignKey: "tenantId", onDelete: "CASCADE" });
ActivityEvent.belongsTo(Company, { foreignKey: "tenantId" });

Company.hasOne(Settings, { foreignKey: "tenantId" });
Settings.belongsTo(Company, { foreignKey: "tenantId" });

User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

User.hasMany(WorkSession, { foreignKey: "userId", onDelete: "CASCADE" });
WorkSession.belongsTo(User, { foreignKey: "userId" });

User.hasMany(ActivityEvent, { foreignKey: "userId", onDelete: "CASCADE" });
ActivityEvent.belongsTo(User, { foreignKey: "userId" });

WorkSession.hasMany(ActivityEvent, { foreignKey: "sessionId", onDelete: "CASCADE" });
ActivityEvent.belongsTo(WorkSession, { foreignKey: "sessionId" });

module.exports = {
  sequelize,
  Company,
  User,
  RefreshToken,
  WorkSession,
  ActivityEvent,
  Settings,
};