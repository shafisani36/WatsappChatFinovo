const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/users", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.getChattableUsers);
router.get("/conversations", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.getMyConversations);
router.post("/conversations/direct", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.startDirectConversation);
router.post("/conversations/group", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.createGroupConversation);

router.get("/conversations/:id/messages", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.getMessages);
router.post("/conversations/:id/messages", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.sendMessage);
router.patch("/conversations/:id/read", authorizeRoles("EMPLOYEE", "MANAGER", "COMPANY_ADMIN"), chatController.markAsRead);

router.get("/admin/conversations", authorizeRoles("COMPANY_ADMIN"), chatController.getAllConversationsForAdmin);

module.exports = router;