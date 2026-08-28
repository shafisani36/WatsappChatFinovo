import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { isManagerial } from "./constants/roles";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Employees from "./pages/Employees";
import Leaderboard from "./pages/Leaderboard";

function ProtectedLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  const managerial = isManagerial(user?.role);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

      <Route
        path="/"
        element={<ProtectedLayout>{managerial ? <Dashboard /> : <Tasks />}</ProtectedLayout>}
      />
      {managerial && <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />}
      <Route
        path="/employees"
        element={
          <ProtectedLayout>
            {["ADMIN", "MANAGER"].includes(user?.role) ? <Employees /> : <Navigate to="/" />}
          </ProtectedLayout>
        }
      />
      <Route path="/leaderboard" element={<ProtectedLayout><Leaderboard /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
