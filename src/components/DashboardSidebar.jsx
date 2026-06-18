import { Sparkles, History, BarChart3, Settings, LogOut, ChevronRight, User } from "lucide-react";
import NamasteTelanganaLogo from "./NamasteTelanganaLogo";

export default function DashboardSidebar({ activeTab, onChangeTab, userEmail, onLogout }) {
  const navItems = [
    {
      id: "generate",
      label: "Generate Content",
      icon: <Sparkles className="w-4.5 h-4.5" />
    },
    {
      id: "history",
      label: "History Tracking",
      icon: <History className="w-4.5 h-4.5" />
    },
    {
      id: "analytics",
      label: "Analytics Dashboard",
      icon: <BarChart3 className="w-4.5 h-4.5" />
    },
    {
      id: "settings",
      label: "Profile Settings",
      icon: <Settings className="w-4.5 h-4.5" />
    }
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col h-screen shrink-0 text-slate-100 select-none">
      {/* Brand logo container */}
      <div className="h-16 flex items-center px-6 border-b border-slate-900 gap-2.5 shrink-0">
        <NamasteTelanganaLogo size="sm" showSubtitle={true} />
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <span className="block px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Workspace</span>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-purple-950/40 border border-purple-800/40 text-purple-200 shadow-md shadow-purple-500/5 hover:bg-purple-950/50"
                  : "border border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className={`transition-transform duration-250 ${isActive ? "scale-105 text-purple-400" : "text-slate-500"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* User profile item & logout container */}
      <div className="p-4 border-t border-slate-900 space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-300 truncate">News Editor</span>
            <span className="text-[10px] text-slate-500 font-mono truncate">{userEmail}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );
}
