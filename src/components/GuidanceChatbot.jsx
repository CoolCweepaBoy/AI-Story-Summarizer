import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Bot, AlertCircle, RefreshCw } from "lucide-react";

export default function GuidanceChatbot({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "నమస్తే! I am your Namaste Telangana Editorial Guide. How can I help you draft stories, improve headers, or navigate this workspace today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);
    setError(null);

    const backupMessages = [...messages, userMsg];

    try {
      const response = await fetch("/api/guide-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messages: backupMessages })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to communicate with editorial guide.");
      }

      const resData = await response.json();
      setMessages((prev) => [...prev, { role: "model", content: resData.content }]);
    } catch (err) {
      console.error("Guidance chatbot error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const menuSuggestions = [
    "Translate a Telugu line",
    "Polish a draft paragraph",
    "Suggest headlines on Telangana development",
    "How does the summary tab work?"
  ];

  return (
    <div id="guidance-chatbot-root" className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-80 md:w-96 h-[500px] bg-slate-900/95 border border-slate-800 shadow-2xl shadow-blue-500/10 rounded-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-xl"
          >
            {/* Window header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1">
                    Editorial Guide
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                  </h4>
                  <span className="text-[10px] text-blue-400 font-bold block leading-none font-telugu">నమస్తే తెలంగాణ సహాయకుడు</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message timeline area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 bg-slate-900/40">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "model" && (
                    <div className="w-6.5 h-6.5 rounded-md bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-800/40 shrink-0">
                      న
                    </div>
                  )}
                  <div 
                    className={`max-w-[80%] rounded-xl px-3 py-2.5 text-xs inline-block leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10" 
                        : "bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-6.5 h-6.5 rounded-md bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-800/40 shrink-0">
                    న
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl rounded-tl-none px-3.5 py-3 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-400">Connection Interrupted</p>
                    <p className="text-[11px] text-red-300/80 mt-0.5 leading-normal">{error}</p>
                    <button 
                      onClick={() => handleSend(messages[messages.length - 1]?.content || "Retry connect")}
                      className="mt-2 text-[10px] font-semibold text-red-400 hover:text-red-300 underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" /> Retry Connection
                    </button>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions wrapper */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-950/30 flex flex-wrap gap-1.5 shrink-0 select-none">
                {menuSuggestions.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] font-medium bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 hover:text-white text-slate-300 px-2 py-1 rounded-md transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Message input panel */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything editor..."
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="w-8.5 h-8.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center text-white shadow-md shadow-blue-600/10 transition-all disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher trigger */}
      <motion.button
        id="chatbot-trigger-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 flex flex-col items-center justify-center text-white relative border border-blue-500/30 group cursor-pointer"
      >
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center animate-pulse">
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
        </div>
        
        {isOpen ? (
          <X className="w-5.5 h-5.5" />
        ) : (
          <div className="flex flex-col items-center">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[7.5px] font-bold font-telugu leading-none mt-0.5 select-none font-sans">నమస్తే</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
