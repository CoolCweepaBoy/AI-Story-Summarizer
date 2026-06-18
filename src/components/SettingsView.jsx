import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Key, 
  Bell, 
  Eye, 
  EyeOff,
  Info,
  CheckCircle2
} from "lucide-react";

export default function SettingsView({ userEmail }) {
  // Profile inputs
  const [name, setName] = useState("Lead Newsroom Editor");
  const [org, setOrg] = useState("Global News Corp Ltd");
  
  // Custom API key options
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••••");
  const [showKey, setShowKey] = useState(false);
  
  // States switches
  const [darkMode, setDarkMode] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [instantAlert, setInstantAlert] = useState(true);

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveAll = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="max-w-2xl bg-slate-900/40 p-8 rounded-2xl border border-white/[0.04] space-y-8 select-none">
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Workspace Settings</h2>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Profile Node: PRODUCTION</span>
      </div>

      {savedMsg && (
        <div className="bg-emerald-950/45 border border-emerald-800/50 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Your preferences have been saved securely to local cache.</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-7">
        
        {/* Section 1: User details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" /> Journalist & Editor Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-900 focus:border-purple-500/50 rounded-xl py-2.5 px-4 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Organization</label>
              <input 
                type="text" 
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-900 focus:border-purple-500/50 rounded-xl py-2.5 px-4 text-xs text-slate-100 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Authenticated Email</label>
            <input 
              type="text" 
              value={userEmail} 
              disabled
              className="w-full bg-slate-950/40 border border-slate-900 rounded-xl py-2.5 px-4 text-xs text-slate-500 outline-none cursor-not-allowed font-mono"
            />
          </div>
        </div>

        {/* Section 2: API Keys explanations */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" /> Gemini API Key Management
          </h3>
          <div className="bg-purple-950/15 border border-purple-900/15 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-purple-300">
            <Info className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">Automated Credentials Binding</span>
              <span>This workspace automatically injects your pre-configured <span className="text-white font-semibold">GEMINI_API_KEY</span> securely from Cloud Run Secrets at module load. Individual user overrides are typically unnecessary in standard newsrooms.</span>
            </div>
          </div>
          <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Secret Placeholder</label>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"} 
                value={apiKey}
                disabled
                className="w-full bg-slate-950/40 border border-slate-900 rounded-xl py-2.5 pl-4 pr-10 text-xs text-slate-500 outline-none cursor-not-allowed font-mono"
              />
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-450 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Notification swiches */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Bell className="w-4 h-4 text-pink-400" /> Notifications & General
          </h3>
          
          <div className="space-y-3">
            {/* Dark mode lock indicator */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-xl border border-slate-900/60 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-300 block">Modern SaaS Dark Mode</span>
                <span>Lock system interface viewport in charcoal twilight settings</span>
              </div>
              <button 
                type="button" 
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-1 bg-purple-950/40 border border-purple-900/40 text-purple-400 rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer"
              >
                {darkMode ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            {/* Weekly summaries */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-xl border border-slate-900/60 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-300 block">Weekly Digest Summaries</span>
                <span>Receive compiled email metrics detailing story ratings & volume</span>
              </div>
              <button 
                type="button" 
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative flex items-center px-1.5 ${weeklyDigest ? "bg-purple-600 justify-end" : "bg-slate-900 justify-start border border-slate-800"}`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white block" />
              </button>
            </div>

            {/* Instant Alert */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-xl border border-slate-900/60 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-300 block">System Alerts & Faults</span>
                <span>Trigger browser push indicators for slow Gemini API responses</span>
              </div>
              <button 
                type="button" 
                onClick={() => setInstantAlert(!instantAlert)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative flex items-center px-1.5 ${instantAlert ? "bg-purple-600 justify-end" : "bg-slate-900 justify-start border border-slate-800"}`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white block" />
              </button>
            </div>
          </div>
        </div>

        {/* Buttons Submit */}
        <div className="pt-4 border-t border-slate-900 text-right">
          <button 
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold cursor-pointer transition-all shadow-md"
          >
            Save Environment Preferences
          </button>
        </div>

      </form>
    </div>
  );
}
