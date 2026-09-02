const User = require("./User");
const Task = require("./Task");
const RefreshToken = require("./RefreshToken");

Task.belongsTo(User, { as: "assignee", foreignKey: "assignedToId" });
Task.belongsTo(User, { as: "creator", foreignKey: "createdById" });

User.hasMany(Task, { as: "assignedTasks", foreignKey: "assignedToId" });
User.hasMany(Task, { as: "createdTasks", foreignKey: "createdById" });

User.hasMany(RefreshToken, { as: "refreshTokens", foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Task, RefreshToken };
