import React, { useEffect, useState } from "react";
import { getSocket } from "../api/socket";

export default function TopBar({ title, subtitle }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    setConnected(socket.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 shrink-0">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-300"}`} />
        {connected ? "Live" : "Connecting..."}
      </div>
    </div>
  );
}
