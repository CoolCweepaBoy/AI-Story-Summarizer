import { Search, Bell, Clock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardNavbar({ activeTab, searchQuery, onSearchChange, userEmail, onLogout }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case "generate":
        return "AI Content Generator";
      case "history":
        return "Editorial Generation History";
      case "analytics":
        return "SaaS Analytics Dashboard";
      case "settings":
        return "Profile & Integration Configuration";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-900 px-6 md:px-8 flex items-center justify-between shrink-0 text-slate-100 relative z-10 select-none">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
          {getPageTitle()}
        </h1>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold tracking-wider font-mono uppercase">
          Live Connection
        </span>
      </div>

      {/* Global query input & clocks */}
      <div className="flex items-center gap-6">
        {/* Dynamic Search Input for general filtering */}
        {(activeTab === "history") && (
          <div className="relative hidden md:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search history by keyword..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 bg-slate-900/60 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/20"
            />
          </div>
        )}

        {/* Realtime clock status */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/40 border border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>UTC {timeStr}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors relative cursor-pointer">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
          </button>
          
          <div className="w-px h-6 bg-slate-900" />

          {/* Profile Badge status */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-300">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "E"}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-900 hover:border-rose-900/30 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-semibold transition-all cursor-pointer"
                title="Sign Out Session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
