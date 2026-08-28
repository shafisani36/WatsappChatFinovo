const express = require("express");
const { User, Task } = require("../models");
const { protect } = require("../middleware/auth");
const { LEADERBOARD_ROLES } = require("../config/roles");
const sequelize = require("../config/db");

const router = express.Router();
router.use(protect);

// GET /leaderboard — everyone except ADMIN, ranked by points, highest first.
router.get("/", async (req, res) => {
  const users = await User.findAll({
    where: { role: LEADERBOARD_ROLES, status: "active" },
    attributes: [
      "id",
      "name",
      "role",
      "points",
      [sequelize.fn("COUNT", sequelize.col("assignedTasks.id")), "completedCount"],
    ],
    include: [
      { model: Task, as: "assignedTasks", attributes: [], where: { status: "Completed" }, required: false },
    ],
    group: ["User.id"],
    order: [["points", "DESC"]],
  });

  const ranked = users.map((u, index) => ({
    rank: index + 1,
    id: u.id,
    name: u.name,
    role: u.role,
    points: u.points,
    completedCount: Number(u.get("completedCount")) || 0,
  }));

  res.json(ranked);
});

module.exports = router;
