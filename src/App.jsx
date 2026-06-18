/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// Page Components
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardNavbar from "./components/DashboardNavbar";
import GenerationView from "./components/GenerationView";
import HistoryView from "./components/HistoryView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import GuidanceChatbot from "./components/GuidanceChatbot";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  // Navigation Screens state
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [activeTab, setActiveTab] = useState("generate");

  // Auth User state
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Global list indicators
  const [historyList, setHistoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Connect custom auth session verification on mount
  useEffect(() => {
    const verifySession = async () => {
      setAuthLoading(true);
      const token = localStorage.getItem("newsroom_session_token");
      if (token) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserToken(token);
            setUserEmail(data.email || "editor@newsroom-ai.com");
            setCurrentScreen("dashboard");
            await fetchHistory(token);
          } else {
            // Token expired or invalid
            localStorage.removeItem("newsroom_session_token");
            setUserToken(null);
            setUserEmail(null);
            setCurrentScreen("landing");
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          setCurrentScreen("landing");
        }
      } else {
        setUserToken(null);
        setUserEmail(null);
        setCurrentScreen("landing");
      }
      setAuthLoading(false);
    };

    verifySession();
  }, []);

  const fetchHistory = async (token) => {
    try {
      const response = await fetch("/api/history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const list = await response.json();
        setHistoryList(list);
      }
    } catch (err) {
      console.error("Failed to load generation histories:", err);
    }
  };

  const handleLoginSuccess = async (token, email) => {
    localStorage.setItem("newsroom_session_token", token);
    setUserToken(token);
    setUserEmail(email);
    setCurrentScreen("dashboard");
    await fetchHistory(token);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("newsroom_session_token");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Logout API request failed:", err);
      }
    }
    localStorage.removeItem("newsroom_session_token");
    setUserToken(null);
    setUserEmail(null);
    setHistoryList([]);
    setCurrentScreen("landing");
  };

  // Synchronize new item additions securely
  const handleSaveHistoryItem = (item) => {
    setHistoryList((prev) => [item, ...prev]);
  };

  // Delete individual record from state and database
  const handleDeleteItem = async (id) => {
    if (!userToken) return;
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      if (response.ok) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to clear historical entry:", err);
    }
  };

  // Rate item rating score trigger helper
  const handleRateItem = async (id, rating) => {
    if (!userToken) return;
    try {
      const response = await fetch(`/api/history/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ rating })
      });
      if (response.ok) {
        setHistoryList((prev) => 
          prev.map((item) => (item.id === id ? { ...item, rating } : item))
        );
      }
    } catch (err) {
      console.error("Failed to rate item:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mb-4" />
        <span className="text-xs font-semibold text-slate-400">Loading AI Story Summarizer Workspace...</span>
      </div>
    );
  }

  // Dashboard Tab Content router
  const renderDashboardContent = () => {
    if (!userToken) return null;

    switch (activeTab) {
      case "generate":
        return (
          <GenerationView 
            token={userToken} 
            onSaveHistoryItem={handleSaveHistoryItem} 
          />
        );
      case "history":
        return (
          <HistoryView 
            historyList={historyList} 
            onDeleteItem={handleDeleteItem} 
            onRateItem={handleRateItem}
            searchQuery={searchQuery}
            token={userToken}
          />
        );
      case "analytics":
        return (
          <AnalyticsView token={userToken} />
        );
      case "settings":
        return (
          <SettingsView userEmail={userEmail || "editor@example.com"} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/20 antialiased overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage 
              onGetStarted={() => setCurrentScreen("login")}
              onLoginClick={() => setCurrentScreen("login")}
              onRegisterClick={() => setCurrentScreen("register")}
            />
          </motion.div>
        )}

        {currentScreen === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setCurrentScreen("landing")}
              onCreateAccountClick={() => setCurrentScreen("register")}
            />
          </motion.div>
        )}

        {currentScreen === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <RegisterPage 
              onBackToLogin={() => setCurrentScreen("login")}
              onBackToLanding={() => setCurrentScreen("landing")}
              onRegisterSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}

        {currentScreen === "dashboard" && userToken && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-screen overflow-hidden"
          >
            {/* Sidebar nav */}
            <DashboardSidebar 
              activeTab={activeTab} 
              onChangeTab={(tab) => { setActiveTab(tab); setSearchQuery(""); }} 
              userEmail={userEmail || "editor@newsroom-ai.com"}
              onLogout={handleLogout}
            />

            {/* Main content body */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
              <DashboardNavbar 
                activeTab={activeTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                userEmail={userEmail || "editor@newsroom-ai.com"}
                onLogout={handleLogout}
              />

              {/* View scroll Container */}
              <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 pb-24 md:pb-24">
                {renderDashboardContent()}
              </main>

              {/* Persistent Editorial Guidance Chatbot */}
              <GuidanceChatbot token={userToken} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
