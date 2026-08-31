const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboard.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), leaderboardController.getLeaderboard);

module.exports = router;
