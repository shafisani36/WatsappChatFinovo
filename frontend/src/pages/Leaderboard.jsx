import { useEffect, useState } from "react";

import api from "../api/axios";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const rankBg = (rank) => {
  if (rank === 1) return "#f59e0b";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#fb923c";
  return "#e2e8f0";
};

const Leaderboard = () => {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const response = await api.get("/leaderboard");
      setBoard(response.data.data);
    } catch (error) {
      setBoard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const poll = setInterval(load, 10000);
    return () => clearInterval(poll);
  }, []);

  const maxPoints = Math.max(...board.map((b) => b.points), 1);

  return (
    <div className="team-page">
      <div className="page-header animate-in">
        <div>
          <h1>Leaderboard</h1>
          <p>Ranked by total points earned from completed tasks</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-card">
          <div className="loader-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : board.length === 0 ? (
        <div className="empty-card animate-card">
          <div className="empty-icon">♧</div>
          <h3>No one has scored yet</h3>
          <p>Points will show up here once tasks start getting completed.</p>
        </div>
      ) : (
        <section className="history-card animate-card">
          <div className="table-header">
            <div>
              <h2>Standings</h2>
              <p>{board.length} people on the board</p>
            </div>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            {board.map((entry) => {
              const widthPct = Math.max((entry.points / maxPoints) * 100, 4);
              return (
                <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: rankBg(entry.rank),
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {entry.rank}
                  </div>

                  <div className="employee-avatar" style={{ flexShrink: 0 }}>
                    {initials(entry.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{entry.name}</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        {entry.points} pts &middot; {entry.completedCount} completed
                      </span>
                    </div>
                    <div style={{ height: 8, background: "var(--border-light)", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${widthPct}%`,
                          background: "var(--primary)",
                          borderRadius: 999,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Leaderboard;
