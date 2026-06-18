import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  Grid, 
  Users, 
  Calendar, 
  RefreshCw,
  Info
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function AnalyticsView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analytics", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to parse server analytics metrics.");
      }
      const body = await response.json();
      setData(body);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while loading analytics charts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  // Modern pie cell color palettes
  const PIE_COLORS = ["#a78bfa", "#818cf8", "#f472b6", "#2dd4bf", "#fbbf24", "#38bdf8"];

  // Custom tooltip styles for the charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 border border-slate-900 p-3 rounded-xl font-mono text-[10px] space-y-1.5 shadow-2xl">
          <p className="text-slate-400 font-bold">{label}</p>
          <p className="text-purple-300 font-semibold uppercase tracking-wider">
            Generations: <span className="text-white font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-900 border-t-purple-600 animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Gathering dashboard stats...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl flex flex-col items-center text-center max-w-lg mx-auto py-10 space-y-4">
        <Info className="w-8 h-8 text-red-400 shrink-0" />
        <h3 className="text-sm font-bold text-slate-200">Failed to load system metrics</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{error || "Check your Postgres instance connection state."}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white rounded-xl border border-slate-800 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try reloading
        </button>
      </div>
    );
  }

  const stats = data.summaryStats;

  return (
    <div className="space-y-8 select-none">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Generations */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] relative overflow-hidden flex items-center justify-between group hover:border-purple-900/30 transition-all">
          <div className="absolute -top-3 -right-3 p-4 opacity-[0.02] text-white pointer-events-none">
            <BarChart3 className="w-24 h-24" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">My Generations</span>
            <span className="block text-2xl font-extrabold text-white font-sans mt-1.5">{stats.totalGenerations}</span>
            <span className="text-[10.5px] text-purple-400 font-bold block mt-1.5">Across all categories</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-950/55 border border-purple-800/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] relative overflow-hidden flex items-center justify-between group hover:border-amber-900/30 transition-all">
          <div className="absolute -top-3 -right-3 p-4 opacity-[0.02] text-white pointer-events-none">
            <Star className="w-24 h-24" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Average Rating</span>
            <span className="block text-2xl font-extrabold text-white font-sans mt-1.5">{stats.averageRating || "0.0"} <span className="text-xs text-slate-500">/ 5</span></span>
            <span className="text-[10.5px] text-amber-400 font-bold block mt-1.5">User rated feedback</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/45 border border-amber-800/40 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </div>
        </div>

        {/* Most Used Category */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] relative overflow-hidden flex items-center justify-between group hover:border-indigo-900/30 transition-all">
          <div className="absolute -top-3 -right-3 p-4 opacity-[0.02] text-white pointer-events-none">
            <Grid className="w-24 h-24" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Most Used Category</span>
            <span className="block text-lg font-extrabold text-white font-sans mt-2 truncate max-w-[140px] leading-tight">{stats.mostUsedCategory}</span>
            <span className="text-[10.5px] text-indigo-400 font-bold block mt-2">Preferred story sector</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/55 border border-indigo-800/40 flex items-center justify-center shrink-0">
            <Grid className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Total Users (SaaS Admin metrics!) */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] relative overflow-hidden flex items-center justify-between group hover:border-teal-900/30 transition-all">
          <div className="absolute -top-3 -right-3 p-4 opacity-[0.02] text-white pointer-events-none">
            <Users className="w-24 h-24" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Registered Users</span>
            <span className="block text-2xl font-extrabold text-white font-sans mt-1.5">{stats.totalUsers} <span className="text-xs text-slate-500">active</span></span>
            <span className="text-[10.5px] text-teal-400 font-bold block mt-1.5">
              Archived entries: <span className="text-white font-sans">{stats.totalGlobalGenerations}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-950/45 border border-teal-800/40 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Timeline chart */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Daily Summary Generation Trends</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">7 Day range</span>
          </div>

          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyUsage} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/20" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#purpleGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution Pie Chart */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white">Share by News category</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Topic spread</span>
          </div>

          <div className="h-64 flex flex-col justify-between">
            {data.categoryDistribution.length === 0 ? (
              <div className="flex-1 flex items-center justify-center font-mono text-[10px] text-slate-500">
                Generate story cards to populate distribution maps.
              </div>
            ) : (
              <>
                <div className="flex-1 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(15,23,42,0.8)" strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} generations`, "Shares"]} contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "10px", fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center pt-2">
                  {data.categoryDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 text-[9px] font-mono font-bold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-slate-400 capitalize">{entry.name}</span>
                      <span className="text-slate-500 ml-0.5">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Monthly Usage chart */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.04] lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white">Monthly Generation Volume</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">6 Month history</span>
          </div>

          <div className="h-56 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyUsage} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/20" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "10px", fontSize: "10px" }} />
                <Bar dataKey="count" fill="#ec4899" radius={[5, 5, 0, 0]} maxBarSize={45}>
                  {data.monthlyUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.monthlyUsage.length - 1 ? "#ec4899" : "#6366f1"} fillOpacity={index === data.monthlyUsage.length - 1 ? 0.95 : 0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
