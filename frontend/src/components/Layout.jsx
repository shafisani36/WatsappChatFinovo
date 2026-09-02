import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

import {
  RecordingProvider,
} from "../contexts/RecordingContext";

const Icon = ({ children }) => (
  <span className="sidebar-icon">
    {children}
  </span>
);

export default function Layout() {
  const {
    user,
    logout,
    isManager,
    isAdmin,
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canViewEmployeeProgress =
    isManager || isAdmin;

  const navItems = [
    {
      to: "/",
      label: "Overview",
      icon: <Icon>☷</Icon>,
    },
    {
      to: "/clock",
      label: "Clock In/Out",
      icon: <Icon>◷</Icon>,
    },
    {
      to: "/tasks",
      label: isManager
        ? "Tasks"
        : "My Tasks",
      icon: <Icon>▤</Icon>,
    },
    {
      to: "/leaderboard",
      label: "Leaderboard",
      icon: <Icon>★</Icon>,
    },
    {
      to: "/chat",
      label: "Chat",
      icon: <Icon>◈</Icon>,
    },
    {
      to: "/reports",
      label: "Reports",
      icon: <Icon>▤</Icon>,
    },
    {
      to: "/history",
      label: "History",
      icon: <Icon>◫</Icon>,
    },
    {
      to: "/recordings",
      label: "Recordings",
      icon: <Icon>●</Icon>,
    },
  ];

  if (isManager) {
    navItems.push({
      to: "/team",
      label: "Employees",
      icon: <Icon>♧</Icon>,
    });
  }

  if (canViewEmployeeProgress) {
    navItems.push({
      to: "/employee-progress",
      label: "Employee Progress",
      icon: <Icon>◫</Icon>,
    });
  }

  return (
    <RecordingProvider>
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="brand">
            <div className="brand-logo">
              F
            </div>

            <span className="brand-name">
              Finovo Global
            </span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                {item.icon}

                <span>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="user-avatar">
              {getInitials(user?.name)}
            </div>

            <div className="user-info">
              <div className="user-name">
                {user?.name || "User"}
              </div>

              <div className="user-role">
                {user?.role || "Employee"}
              </div>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Log out"
            >
              ↪
            </button>
          </div>
        </aside>

        <main className="app-main">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </RecordingProvider>
  );
}