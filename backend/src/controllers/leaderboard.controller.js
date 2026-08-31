const leaderboardService = require("../services/leaderboard.service");

const getLeaderboard = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const board = await leaderboardService.getLeaderboard(tenantId);

    res.status(200).json({
      message: "Leaderboard fetched successfully",
      data: board,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
};

module.exports = { getLeaderboard };
