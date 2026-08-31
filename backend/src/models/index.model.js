const sequelize = require("../config/db");
const Company = require("./company.model");
const User = require("./user.model");
const RefreshToken = require("./refreshToken.model");
const WorkSession = require("./workSession.model");
const ActivityEvent = require("./activityEvent.model");
const Settings = require("./settings.model");
const Task = require("./task.model");
const Conversation = require("./conversation.model");
const ConversationParticipant = require("./conversationParticipant.model");
const Message = require("./message.model");

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

Company.hasMany(Task, { foreignKey: "tenantId", onDelete: "CASCADE" });
Task.belongsTo(Company, { foreignKey: "tenantId" });

User.hasMany(Task, { as: "assignedTasks", foreignKey: "assignedToId" });
Task.belongsTo(User, { as: "assignee", foreignKey: "assignedToId" });

User.hasMany(Task, { as: "createdTasks", foreignKey: "createdById" });
Task.belongsTo(User, { as: "creator", foreignKey: "createdById" });

Company.hasMany(Conversation, { foreignKey: "tenantId", onDelete: "CASCADE" });
Conversation.belongsTo(Company, { foreignKey: "tenantId" });

User.hasMany(Conversation, { as: "createdConversations", foreignKey: "createdById" });
Conversation.belongsTo(User, { as: "creator", foreignKey: "createdById" });

Conversation.hasMany(ConversationParticipant, { as: "participants", foreignKey: "conversationId", onDelete: "CASCADE" });
ConversationParticipant.belongsTo(Conversation, { foreignKey: "conversationId" });

User.hasMany(ConversationParticipant, { foreignKey: "userId", onDelete: "CASCADE" });
ConversationParticipant.belongsTo(User, { foreignKey: "userId" });

Conversation.hasMany(Message, { as: "messages", foreignKey: "conversationId", onDelete: "CASCADE" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });

module.exports = {
  sequelize,
  Company,
  User,
  RefreshToken,
  WorkSession,
  ActivityEvent,
  Settings,
  Task,
  Conversation,
  ConversationParticipant,
  Message,
};