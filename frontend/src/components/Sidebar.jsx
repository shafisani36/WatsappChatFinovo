import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, ListChecks, Users, Trophy, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isManagerial, ROLE_LABELS, ROLE_SOFT } from "../constants/roles";

// ADMIN and MANAGER can both manage employee accounts; PROJECT_COORDINATOR
// can manage tasks but not accounts.
const CAN_MANAGE_EMPLOYEES = ["ADMIN", "MANAGER"];

function navItemsForRole(role) {
  if (isManagerial(role)) {
    const items = [
      { to: "/", label: "Overview", icon: LayoutGrid },
      { to: "/tasks", label: "Tasks", icon: ListChecks },
    ];
    if (CAN_MANAGE_EMPLOYEES.includes(role)) {
      items.push({ to: "/employees", label: "Employees", icon: Users });
    }
    items.push({ to: "/leaderboard", label: "Leaderboard", icon: Trophy });
    return items;
  }
  return [
    { to: "/", label: "My Tasks", icon: ListChecks },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = navItemsForRole(user?.role);

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
          T
        </div>
        <span className="font-semibold text-lg text-slate-900 tracking-tight">TaskBoard</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border-l-[3px] transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-700 border-brand-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className={`w-9 h-9 rounded-full ring-2 flex items-center justify-center text-xs font-bold shrink-0 ${ROLE_SOFT[user?.role]}`}>
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{ROLE_LABELS[user?.role]}</p>
          </div>
        </div>
        {!isManagerial(user?.role) && (
          <div className="mx-2 mb-3 rounded-lg bg-gradient-to-r from-brand-50 to-indigo-50 px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-brand-700">Total points</span>
            <span className="text-sm font-bold text-brand-700">{user?.points ?? 0}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
