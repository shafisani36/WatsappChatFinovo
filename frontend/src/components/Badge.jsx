import React from "react";
import { ROLE_COLORS, ROLE_LABELS } from "../constants/roles";

const statusStyle = {
  Pending: { bg: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  "In Progress": { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  active: { bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  inactive: { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

const pointStyle = {
  2: "bg-slate-100 text-slate-700",
  3: "bg-amber-100 text-amber-800",
  4: "bg-rose-100 text-rose-800",
};

export function Badge({ text }) {
  const s = statusStyle[text] || { bg: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {text}
    </span>
  );
}

export function PointsBadge({ points }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pointStyle[points] || "bg-slate-100 text-slate-700"}`}>{points} pts</span>;
}

export function RoleBadge({ role }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[role] || "bg-slate-500 text-white"}`}>{ROLE_LABELS[role] || role}</span>;
}
