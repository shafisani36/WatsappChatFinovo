const user = require("../models/user.model");
const refreshTokenModel = require("../models/refreshToken.model");
const passwordResetOtpModel = require("../models/passwordResetOtp.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const emailService = require("../services/email.service");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const register = async (req, res) => {
  try {
    const {
      tenantId,
      name,
      email,
      username,
      teamId,
      passwordHash,
      managerId,
      role,
    } = req.body;

    if (!tenantId || !name || !email || !passwordHash) {
      return res.status(400).json({
        message: "Missing required registration fields",
      });
    }

    const isUserAlreadyExisting = await user.findOne({
      where: { tenantId, email },
    });

    if (isUserAlreadyExisting) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(passwordHash, 12);

    let resolvedManagerId = managerId || null;

    if (!resolvedManagerId && (!role || role === "EMPLOYEE")) {
      const defaultManager = await user.findOne({
        where: { tenantId, role: "COMPANY_ADMIN" },
        order: [["createdAt", "ASC"]],
      });
      resolvedManagerId = defaultManager ? defaultManager.id : null;
    }

    const newUser = await user.create({
      tenantId,
      name,
      email,
      username,
      teamId: teamId || null,
      passwordHash: hash,
      managerId: resolvedManagerId,
      role: role || "EMPLOYEE",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        tenantId: newUser.tenantId,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        teamId: newUser.teamId,
        managerId: newUser.managerId,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;

    const existingUser = await user.findOne({
      where: { email },
    });

    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      passwordHash,
      existingUser.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    existingUser.lastLoginAt = new Date();

    await existingUser.save();

    const token = jwt.sign(
      {
        id: existingUser.id,
        tenantId: existingUser.tenantId,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenModel.create({
      tokenHash,
      userId: existingUser.id,
      tenantId: existingUser.tenantId,
      expiresAt,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure:true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure:true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: existingUser.id,
        tenantId: existingUser.tenantId,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
        teamId: existingUser.teamId,
        managerId: existingUser.managerId,
        role: existingUser.role,
        points: existingUser.points,
      },
      token,
      refreshToken: rawRefreshToken,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        message: "Refresh Token is required",
      });
    }

    const tokenHash = hashToken(incomingRefreshToken);

    const storedToken = await refreshTokenModel.findOne({
      where: { tokenHash },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      return res.status(401).json({
        message: "Invalid, expired, or revoked refresh token",
      });
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();

    const existingUser = await user.findByPk(storedToken.userId);

    if (!existingUser) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const newToken = jwt.sign(
      {
        id: existingUser.id,
        tenantId: existingUser.tenantId,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
    const newTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenModel.create({
      tokenHash: newTokenHash,
      userId: existingUser.id,
      tenantId: existingUser.tenantId,
      expiresAt,
    });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure:true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRawRefreshToken, {
      httpOnly: true,
      secure:true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      token: newToken,
      refreshToken: newRawRefreshToken,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error refreshing token",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (incomingRefreshToken) {
      const tokenHash = hashToken(incomingRefreshToken);

      await refreshTokenModel.update(
        { revokedAt: new Date() },
        {
          where: {
            tokenHash,
            revokedAt: null,
          },
        },
      );
    }

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging out",
      error: error.message,
    });
  }
};

const dashboard = async (req, res) => {
  try {
    const existingUser = await user.findByPk(req.user.id, {
      attributes: {
        exclude: ["passwordHash"],
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Current user fetched successfully",
      user: {
        id: existingUser.id,
        tenantId: existingUser.tenantId,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
        teamId: existingUser.teamId,
        managerId: existingUser.managerId,
        role: existingUser.role,
        points: existingUser.points,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching current user",
      error: error.message,
    });
  }
};

const generateOtp = () => {
  return String(
    crypto.randomInt(100000, 999999)
  );
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const existingUser = await user.findOne({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    await passwordResetOtpModel.destroy({
      where: { email },
    });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await passwordResetOtpModel.create({
      email,
      otpHash,
      expiresAt,
    });

    console.log(
      `[OTP] Password reset OTP for ${email}: ${otp}`
    );

    try {
      await emailService.sendOtpEmail(email, otp);
    } catch (emailError) {
      console.warn(
        "[OTP] Email sending failed, but OTP was created. " +
          "Check the console log above to use it for testing. " +
          "Set up SMTP in .env to actually send emails.",
        emailError.message
      );
    }

    return res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await passwordResetOtpModel.findOne({
      where: { email },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        message:
          "OTP expired or not requested. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        message:
          "Too many attempts. Please request a new OTP.",
      });
    }

    const isOtpValid = await bcrypt.compare(
      otp,
      otpRecord.otpHash
    );

    if (!isOtpValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    const resetToken = jwt.sign(
      {
        email,
        purpose: "password_reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        message:
          "Email, reset token, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (tokenError) {
      return res.status(401).json({
        message:
          "Invalid or expired reset session. Please start again.",
      });
    }

    if (
      decoded.purpose !== "password_reset" ||
      decoded.email !== email
    ) {
      return res.status(401).json({
        message:
          "Invalid or expired reset session. Please start again.",
      });
    }

    const existingUser = await user.findOne({
      where: { email },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    existingUser.passwordHash = hash;
    await existingUser.save();

    await passwordResetOtpModel.destroy({
      where: { email },
    });

    await refreshTokenModel.update(
      { revokedAt: new Date() },
      {
        where: {
          userId: existingUser.id,
          revokedAt: null,
        },
      }
    );

    return res.status(200).json({
      message:
        "Password reset successful. You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error resetting password",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  dashboard,
  forgotPassword,
  verifyOtp,
  resetPassword,
};