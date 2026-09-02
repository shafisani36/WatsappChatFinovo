const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, RefreshToken } = require("../models");
const { hashToken } = require("../utils/tokenHash");

const router = express.Router();

const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
}

// Creates a new refresh token, stores only its hash in the DB, and
// returns the RAW token (only this raw value is ever sent to the client).
async function issueRefreshToken(user) {
  const rawToken = crypto.randomBytes(40).toString("hex");
  await RefreshToken.create({
    tokenHash: hashToken(rawToken),
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
  });
  return rawToken;
}

// We set cookies AND return the tokens in the JSON body.
// The frontend (deployed separately on Vercel) uses the JSON body values
// via the Authorization header, which avoids cross-domain cookie issues;
// the cookies are set too in case a same-domain deployment wants to use them.
function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  };
  res.cookie("token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_EXPIRES_MS });
}

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase(), status: "active" } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      token: accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST /auth/refresh-token
// Rotation: the incoming refresh token is revoked and a brand-new one is
// issued every time. If someone reuses an already-revoked token, we reject it —
// that's a sign the token may have been stolen.
router.post("/refresh-token", async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incoming) return res.status(401).json({ message: "Refresh token is required" });

    const tokenHash = hashToken(incoming);
    const stored = await RefreshToken.findOne({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid, expired, or revoked refresh token" });
    }

    stored.revokedAt = new Date();
    await stored.save();

    const user = await User.findByPk(stored.userId);
    if (!user || user.status !== "active") return res.status(401).json({ message: "User not found or inactive" });

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({ token: accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error refreshing token" });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (incoming) {
      const tokenHash = hashToken(incoming);
      await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash, revokedAt: null } });
    }
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = router;
