import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import NamasteTelanganaLogo from "./NamasteTelanganaLogo";

export default function LoginPage({ onLoginSuccess, onBackToLanding, onCreateAccountClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Traditional secure sign in
  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      onLoginSuccess(data.token, data.email);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative px-4 sm:px-6 py-12">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back button */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="w-full max-w-md">
        {/* App Logo Identity */}
        <div className="flex flex-col items-center mb-8">
          <NamasteTelanganaLogo size="lg" showSubtitle={true} />
          <p className="text-slate-400 text-xs mt-3">Sign in to your newsroom workspace</p>
        </div>

        {/* Login Card wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-2xl shadow-2xl relative border border-white/[0.08]"
        >
          {error && (
            <div className="bg-amber-950/45 border border-amber-800/50 text-amber-300 p-3.5 rounded-xl text-xs flex gap-2 mb-6 items-start leading-relaxed animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTraditionalLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/20"
                  placeholder="name@newsroom-ai.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] mt-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : "Sign In"}
            </button>
          </form>
        </motion.div>

        {/* Footer sign up link */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Don't have an automated account yet?{" "}
          <button onClick={onCreateAccountClick} className="text-purple-400 hover:text-purple-300 transition-colors font-medium cursor-pointer">
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
