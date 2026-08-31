const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), taskController.getTasks);
router.get("/assignable-users", authorizeRoles("MANAGER", "COMPANY_ADMIN"), taskController.getAssignableUsers);

router.post("/", authorizeRoles("MANAGER", "COMPANY_ADMIN"), taskController.createTask);

router.patch("/:id/status", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), taskController.updateTaskStatus);
router.patch("/:id", authorizeRoles("MANAGER", "COMPANY_ADMIN"), taskController.updateTask);

module.exports = router;
