import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  Clock3,
  Users,
  BarChart3,
  Image,
  Bell,
  Settings,
  Timer,
  Video,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: ClipboardList,
  },
  {
    name: "Time Tracking",
    path: "/time-tracking",
    icon: Clock3,
  },
  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    name: "Screenshots",
    path: "/screenshots",
    icon: Image,
  },
  {
  name: "Video Recordings",
  path: "/video-recordings",
  icon: Video,
},
  {
    name: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
          <Timer className="h-5 w-5 text-white" />
        </div>

        <div>
          <h1 className="font-bold text-slate-900">
            TimeTrack
          </h1>

          <p className="text-xs text-slate-500">
            Workforce Platform
          </p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-5 w-5" />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Workspace */}
      <div className="border-t border-slate-200 p-4">

        <div className="rounded-xl bg-slate-100 p-3">

          <p className="text-xs font-semibold text-slate-500">
            Workspace
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
            Finovo Global
          </p>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;