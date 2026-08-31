const express = require("express");
const router = express.Router();

const downloadController = require("../controllers/download.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/agent/info", downloadController.getAgentInfo);
router.get("/agent/windows", downloadController.downloadAgentWindows);

module.exports = router;