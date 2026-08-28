// Keep this list in sync with backend/config/roles.js
export const ROLES = [
  "ADMIN",
  "MANAGER",
  "PROJECT_COORDINATOR",
  "FRONTEND_DEVELOPER",
  "BACKEND_DEVELOPER",
  "QA",
  "EMPLOYEE",
];

export const MANAGERIAL_ROLES = ["ADMIN", "MANAGER", "PROJECT_COORDINATOR"];
export const WORKING_ROLES = ["FRONTEND_DEVELOPER", "BACKEND_DEVELOPER", "QA", "EMPLOYEE"];

export const ROLE_LABELS = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  PROJECT_COORDINATOR: "Project Coordinator",
  FRONTEND_DEVELOPER: "Frontend Developer",
  BACKEND_DEVELOPER: "Backend Developer",
  QA: "QA Engineer",
  EMPLOYEE: "Employee",
};

// Solid, higher-contrast chips — each role reads as visually distinct at a glance.
export const ROLE_COLORS = {
  ADMIN: "bg-slate-900 text-white",
  MANAGER: "bg-indigo-600 text-white",
  PROJECT_COORDINATOR: "bg-teal-600 text-white",
  FRONTEND_DEVELOPER: "bg-sky-600 text-white",
  BACKEND_DEVELOPER: "bg-violet-600 text-white",
  QA: "bg-amber-500 text-white",
  EMPLOYEE: "bg-slate-500 text-white",
};

// Matching soft background, used for avatar rings / accent bars where a
// solid chip would be too heavy.
export const ROLE_SOFT = {
  ADMIN: "bg-slate-100 text-slate-700 ring-slate-300",
  MANAGER: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  PROJECT_COORDINATOR: "bg-teal-50 text-teal-700 ring-teal-200",
  FRONTEND_DEVELOPER: "bg-sky-50 text-sky-700 ring-sky-200",
  BACKEND_DEVELOPER: "bg-violet-50 text-violet-700 ring-violet-200",
  QA: "bg-amber-50 text-amber-700 ring-amber-200",
  EMPLOYEE: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const isManagerial = (role) => MANAGERIAL_ROLES.includes(role);
