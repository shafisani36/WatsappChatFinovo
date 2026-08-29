const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.post("/clock-in", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), sessionController.clockIn);
router.post("/clock-out", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), sessionController.clockOut);
router.get("/current", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), sessionController.getCurrentSession);
router.get("/history", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), sessionController.getSessionHistory);

router.post("/:id/pause", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), sessionController.pauseSession);
router.post("/:id/resume", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), sessionController.resumeSession);

module.exports = router;