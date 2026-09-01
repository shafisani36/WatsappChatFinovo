const express = require("express");

const router = express.Router();

const activityController = require(
  "../controllers/activity.controller"
);

const {
  authenticate,
} = require(
  "../middlewares/auth.middleware"
);

router.get(
  "/current",
  authenticate,
  activityController.getCurrentActivity
);

module.exports = router;