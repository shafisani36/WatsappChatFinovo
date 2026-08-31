import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../components/layout/DashboardLayout";
import Tasks from "../pages/Tasks";
import TimeTracking from "../pages/TimeTracking";
import Employees from "../pages/Employees";
import Reports from "../pages/Reports";
import Screenshots from "../pages/Screenshots";
import Alerts from "../pages/Alerts";
import Settings from "../pages/Settings";
import VideoRecordings from "../pages/VideoRecordings";

function Approutes() {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Dashboard Layout */}
      <Route element={<DashboardLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
  path="/settings"
  element={<Settings />}
/>
<Route path="/video-recordings" element={<VideoRecordings />} />

         <Route
          path="/tasks"
          element={<Tasks />}
        />

        <Route
  path="/employees"
  element={<Employees />}
/>

<Route
  path="/alerts"
  element={<Alerts />}
/>
<Route
  path="/reports"
  element={<Reports />}
/>

<Route
  path="/screenshots"
  element={<Screenshots />}
/>
        <Route
  path="/time-tracking"
  element={<TimeTracking />}
/>

      </Route>

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Unknown */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
      
    
    </Routes>
  );
}

export default Approutes;