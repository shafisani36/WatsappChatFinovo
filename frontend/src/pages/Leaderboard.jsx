import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import { RoleBadge } from "../components/Badge";
import TopBar from "../components/TopBar";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const rankStyle = (rank) => {
  if (rank === 1) return "bg-gradient-to-br from-amber-400 to-amber-500 text-white";
  if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-400 text-white";
  if (rank === 3) return "bg-gradient-to-br from-orange-300 to-orange-400 text-white";
  return "bg-slate-100 text-slate-500";
};

const barStyle = (rank) => {
  if (rank === 1) return "bg-gradient-to-r from-amber-400 to-amber-500";
  if (rank === 2) return "bg-gradient-to-r from-slate-400 to-slate-500";
  if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-500";
  return "bg-gradient-to-r from-brand-500 to-brand-600";
};

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/leaderboard");
    setBoard(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    const onUpdate = () => load();
    socket.on("leaderboard:updated", onUpdate);
    return () => socket.off("leaderboard:updated", onUpdate);
  }, []);

  if (loading) return <p className="text-slate-500">Loading leaderboard...</p>;

  const maxPoints = Math.max(...board.map((b) => b.points), 1);

  return (
    <div className="space-y-6">
      <TopBar title="Leaderboard" subtitle="Ranked by total points earned from completed tasks" />

      {board.length === 0 ? (
        <p className="text-sm text-slate-500">No one has completed a task yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
          {board.map((entry) => {
            const widthPct = Math.max((entry.points / maxPoints) * 100, 4);
            return (
              <div key={entry.id} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rankStyle(entry.rank)}`}>
                  {entry.rank}
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-slate-50">
                  {initials(entry.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-slate-800 truncate">{entry.name}</span>
                      <RoleBadge role={entry.role} />
                    </div>
                    <span className="text-xs text-slate-500 font-medium shrink-0">{entry.points} pts · {entry.completedCount} completed</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ease-out ${barStyle(entry.rank)}`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
