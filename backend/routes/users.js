const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { protect, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/roles");

const router = express.Router();
router.use(protect);

// GET /users — used to populate "assign to" dropdowns; every logged-in role can list
router.get("/", async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "points", "status"],
    order: [["name", "ASC"]],
  });
  res.json(users);
});

router.get("/roles", (req, res) => res.json(ROLES));

router.get("/me", async (req, res) => {
  const { id, name, email, role, points } = req.user;
  res.json({ id, name, email, role, points });
});

// POST /users — ADMIN or MANAGER can create accounts.
// Only ADMIN can create another ADMIN account — a Manager creating an
// account is capped at the non-admin roles, so managers can't promote
// themselves or anyone else to Admin.
router.post("/", authorize("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (role === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only an Admin can create another Admin account" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "EMPLOYEE",
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, points: user.points });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "A user with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error creating user" });
  }
});

// PATCH /users/:id — ADMIN or MANAGER. A Manager cannot touch an Admin
// account (deactivate, or promote someone to Admin) — only an Admin can.
router.patch("/:id", authorize("ADMIN", "MANAGER"), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.user.role !== "ADMIN") {
    if (user.role === "ADMIN") {
      return res.status(403).json({ message: "Only an Admin can modify an Admin account" });
    }
    if (req.body.role === "ADMIN") {
      return res.status(403).json({ message: "Only an Admin can grant the Admin role" });
    }
  }

  const allowed = ["status", "role", "name"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  });
  await user.save();

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, points: user.points, status: user.status });
});

module.exports = router;
