import React from "react";

const colorMap = {
  brand: "bg-brand-50 text-brand-600",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

export default function StatCard({ label, value, icon: Icon, color = "brand" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md hover:shadow-slate-100 transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">{value}</p>
    </div>
  );
}
