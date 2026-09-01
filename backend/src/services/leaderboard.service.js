const { User, Task, sequelize } = require("../models/index.model");

const LEADERBOARD_ROLES = ["MANAGER", "EMPLOYEE"];

class LeaderboardService {
  async getLeaderboard(tenantId) {
    const users = await User.findAll({
      where: { tenantId, role: LEADERBOARD_ROLES },
      attributes: [
        "id",
        "name",
        "role",
        "points",
        [sequelize.fn("COUNT", sequelize.col("assignedTasks.id")), "completedCount"],
      ],
      include: [
        {
          model: Task,
          as: "assignedTasks",
          attributes: [],
          where: { status: "Completed" },
          required: false,
        },
      ],
      group: ["User.id"],
      order: [["points", "DESC"]],
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      role: user.role,
      points: user.points,
      completedCount: Number(user.get("completedCount")) || 0,
    }));
  }
}

module.exports = new LeaderboardService();
