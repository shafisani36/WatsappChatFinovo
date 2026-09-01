const express = require("express");

const router = express.Router();

const reportController =
  require("../controllers/report.controller");

const {
  authenticate,
} = require("../middlewares/auth.middleware");

router.use(authenticate);

router.post(
  "/ping",
  reportController.ping
);

router.get(
  "/activity/current",
  reportController.getCurrentActivity
);

router.get(
  "/daily",
  reportController.getDailyReport
);

router.get(
  "/weekly",
  reportController.getWeeklyReport
);

router.get(
  "/monthly",
  reportController.getMonthlyReport
);

router.get(
  "/team",
  reportController.getTeamReport
);

router.get(
  "/employee-progress",
  reportController.getEmployeeProgress
);

module.exports = router;