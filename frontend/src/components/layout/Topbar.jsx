import {
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">

      {/* Left */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Work Overview
        </h2>

        <p className="text-sm text-slate-500">
          Monitor your team's productivity and time
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">

          <Search className="h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

        </div>

        {/* Notifications */}
        <button className="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100">

          <Bell className="h-5 w-5" />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />

        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-100">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            AZ
          </div>

          <div className="hidden text-left md:block">

            <p className="text-sm font-semibold text-slate-900">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Company Admin
            </p>

          </div>

          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />

        </button>

      </div>

    </header>
  );
}

export default Topbar;