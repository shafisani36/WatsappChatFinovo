import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../api/axios";
import { Badge, RoleBadge } from "../components/Badge";
import TopBar from "../components/TopBar";
import { ROLES, ROLE_LABELS } from "../constants/roles";
import { useAuth } from "../context/AuthContext";

export default function Employees() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";
  const assignableRoles = isAdmin ? ROLES : ROLES.filter((r) => r !== "ADMIN");
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  useEffect(() => { load(); }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "EMPLOYEE" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    }
  };

  const toggleStatus = async (u) => {
    await api.patch(`/users/${u.id}`, { status: u.status === "active" ? "inactive" : "active" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <TopBar title="Employees" subtitle="Manage accounts and roles across the team" />
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm shadow-brand-200 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Employee
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
          {error && <p className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <input required placeholder="Full name" value={form.name} onChange={update("name")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          <input required type="email" placeholder="Email" value={form.email} onChange={update("email")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          <input required type="password" placeholder="Temporary password" value={form.password} onChange={update("password")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          <select value={form.role} onChange={update("role")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {assignableRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button type="submit" className="md:col-span-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg">
            Create Account
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Points</th>
              <th className="px-5 py-3 font-medium">Status</th>
              {(isAdmin || isManager) && <th className="px-5 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              // A Manager can act on any row except another Admin's.
              const canAct = isAdmin || (isManager && u.role !== "ADMIN");
              return (
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3 text-slate-600 font-semibold">{u.points}</td>
                  <td className="px-5 py-3"><Badge text={u.status} /></td>
                  {(isAdmin || isManager) && (
                    <td className="px-5 py-3">
                      {canAct && (
                        <button onClick={() => toggleStatus(u)} className="text-xs font-medium text-brand-600 hover:underline">
                          {u.status === "active" ? "Deactivate" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
