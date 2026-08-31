import { Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import DownloadAgent from "./pages/DownloadAgent";

import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";

import ClockInOut from "./pages/ClockInOut";

import Login from "./pages/Login";

import Register from "./pages/Register";

import Reports from "./pages/Reports";

import SessionHistory from "./pages/SessionHistory";

import TeamReport from "./pages/TeamReport";

import Tasks from "./pages/Tasks";

import Leaderboard from "./pages/Leaderboard";

import Chat from "./pages/Chat";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,

          style: {
            borderRadius: "10px",
            fontSize: "13px",
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/clock" element={<ClockInOut />} />
            <Route path="/download-agent" element={<DownloadAgent />} />
            <Route path="/reports" element={<Reports />} />

            <Route path="/history" element={<SessionHistory />} />

            <Route path="/team" element={<TeamReport />} />

            <Route path="/tasks" element={<Tasks />} />

            <Route path="/leaderboard" element={<Leaderboard />} />

            <Route path="/chat" element={<Chat />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}