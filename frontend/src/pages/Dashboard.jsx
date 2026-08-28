import React, { useEffect, useState } from "react";
import { ListChecks, Clock, Activity, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import StatCard from "../components/StatCard";
import TopBar from "../components/TopBar";
import { Badge, PointsBadge, RoleBadge } from "../components/Badge";

const STATUS_COLORS = { Pending: "#94a3b8", "In Progress": "#3b82f6", Completed: "#10b981" };

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/tasks");
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    const onUpdate = () => load();
    socket.on("task:updated", onUpdate);
    return () => socket.off("task:updated", onUpdate);
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const pending = tasks.filter((t) => t.status === "Pending").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const recent = tasks.slice(0, 8);

  const chartData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <TopBar title="Overview" subtitle="Team activity at a glance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={tasks.length} icon={ListChecks} color="brand" />
        <StatCard label="Pending" value={pending} icon={Clock} color="slate" />
        <StatCard label="In Progress" value={inProgress} icon={Activity} color="blue" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Tasks</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 px-5 py-10 text-center">No tasks created yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-medium">Task</th>
                  <th className="px-5 py-3 font-medium">Assigned to</th>
                  <th className="px-5 py-3 font-medium">Points</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-800">{t.title}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{t.assignee?.name}</span>
                        <RoleBadge role={t.assignee?.role} />
                      </div>
                    </td>
                    <td className="px-5 py-3"><PointsBadge points={t.points} /></td>
                    <td className="px-5 py-3"><Badge text={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-2">Status Breakdown</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
