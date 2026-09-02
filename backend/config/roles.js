// All roles in the system. ADMIN, MANAGER and PROJECT_COORDINATOR can create
// and assign tasks ("managerial" roles). The other four are "working" roles —
// they get assigned tasks and earn points by completing them.
const ROLES = [
  "ADMIN",
  "MANAGER",
  "PROJECT_COORDINATOR",
  "FRONTEND_DEVELOPER",
  "BACKEND_DEVELOPER",
  "QA",
  "EMPLOYEE",
];

const MANAGERIAL_ROLES = ["ADMIN", "MANAGER", "PROJECT_COORDINATOR"];
const WORKING_ROLES = ["FRONTEND_DEVELOPER", "BACKEND_DEVELOPER", "QA", "EMPLOYEE"];

// Roles that can appear on the leaderboard (everyone except pure admins,
// since admins don't get assigned tasks in this system).
const LEADERBOARD_ROLES = [...MANAGERIAL_ROLES.filter((r) => r !== "ADMIN"), ...WORKING_ROLES];

module.exports = { ROLES, MANAGERIAL_ROLES, WORKING_ROLES, LEADERBOARD_ROLES };
