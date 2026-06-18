import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, User, ArrowLeft, AlertCircle } from "lucide-react";

export default function RegisterPage({ onBackToLogin, onBackToLanding, onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please complete all fields in the registration form.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      // Auto login after successful registration
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        onBackToLogin();
        return;
      }

      onRegisterSuccess(loginData.token, loginData.email);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative px-4 py-12">
      {/* Background radial layer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back button */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="w-full max-w-md">
        {/* Core Identity */}
        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Get immediate newsroom summarization access</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-2xl shadow-2xl relative border border-white/[0.08]"
        >
          {error && (
            <div className="bg-amber-950/45 border border-amber-800/50 text-amber-300 p-3.5 rounded-xl text-xs flex gap-2 mb-6 items-start leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

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
                  className="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-650"
                  placeholder="doe@newsroom-ai.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-650"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 focus:border-purple-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-650"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Configure Account
            </button>
          </form>
        </motion.div>

        {/* Footer link */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Already have checking access?{" "}
          <button onClick={onBackToLogin} className="text-purple-400 hover:text-purple-300 transition-colors font-medium cursor-pointer">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
