const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");


router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authenticate, authController.logout);
router.get("/dashboard",authenticate, authController.dashboard);

module.exports = router;