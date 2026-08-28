require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");
const { User } = require("../models");

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const accounts = [
    { name: "Admin", email: "admin@company.com", role: "ADMIN", password: "admin123" },
    { name: "Hassan Manager", email: "manager@company.com", role: "MANAGER", password: "manager123" },
    { name: "Ayesha Coordinator", email: "coordinator@company.com", role: "PROJECT_COORDINATOR", password: "coord123" },
    { name: "Ali Raza", email: "ali@company.com", role: "FRONTEND_DEVELOPER", password: "employee123" },
    { name: "Sara Khan", email: "sara@company.com", role: "BACKEND_DEVELOPER", password: "employee123" },
    { name: "Bilal Ahmed", email: "bilal@company.com", role: "QA", password: "employee123" },
    { name: "Zainab Tariq", email: "zainab@company.com", role: "EMPLOYEE", password: "employee123" },
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ where: { email: acc.email } });
    if (existing) {
      console.log(`Already exists: ${acc.email} (${acc.role})`);
      continue;
    }
    const passwordHash = await bcrypt.hash(acc.password, 10);
    await User.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role });
    console.log(`Created: ${acc.email} / ${acc.password}  (${acc.role})`);
  }

  console.log("\nSeeding complete. Please change these passwords after first login.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
