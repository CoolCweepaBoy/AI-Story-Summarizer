import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  FileDown, 
  RefreshCw, 
  Star, 
  Quote, 
  Twitter, 
  Facebook, 
  Hash, 
  User, 
  Layers, 
  Info
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function GenerationView({ token, onSaveHistoryItem }) {
  // Input fields
  const [journalistName, setJournalistName] = useState("");
  const [category, setCategory] = useState("Politics");
  const [fullArticle, setFullArticle] = useState("");

  // UI state managers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCaptionTab, setActiveCaptionTab] = useState("variant1");

  // Output container
  const [result, setResult] = useState(null);

  // Copy indicators
  const [copiedField, setCopiedField] = useState(null);
  const [savedRating, setSavedRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const categories = ["Politics", "Sports", "Entertainment", "Technology", "Business", "Education"];

  // Handle temporary copy animations
  const triggerCopyNotify = (field) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleClear = () => {
    setJournalistName("");
    setCategory("Politics");
    setFullArticle("");
    setResult(null);
    setSavedRating(null);
    setError(null);
  };

  // Run AI content generation
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setResult(null);
    setSavedRating(null);

    if (!journalistName.trim()) {
      setError("Please specify the Journalist/Author name before proceeding.");
      return;
    }
    if (!fullArticle.trim()) {
      setError("Please paste the full news article content to process summaries.");
      return;
    }
    if (fullArticle.trim().length < 50) {
      setError("The pasted article is too short. Please provide at least 50 characters of depth.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          journalistName: journalistName.trim(),
          category,
          fullArticle: fullArticle.trim()
        })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || "Generation query failed.");
      }

      setResult(body);
      onSaveHistoryItem(body); // update tracking histories instantly
    } catch (err) {
      console.error(err);
      setError(err.message || "A network or validation error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Rating Feedback (1-5 stars)
  const handleRate = async (starVal) => {
    if (!result || result.id === -1) return;
    setRatingLoading(true);
    try {
      const response = await fetch(`/api/history/${result.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating: starVal })
      });

      if (response.ok) {
        setSavedRating(starVal);
        // update memory item values
        result.rating = starVal;
      }
    } catch (err) {
      console.error("Failed to post rating:", err);
    } finally {
      setRatingLoading(false);
    }
  };

  // Copy individual text blocks safely
  const handleCopyText = (textVal, fieldKey) => {
    navigator.clipboard.writeText(textVal);
    triggerCopyNotify(fieldKey);
  };

  // Copy ALL outputs together
  const handleCopyAll = () => {
    if (!result) return;
    const bulletLines = JSON.parse(result.summary);
    const summaryStr = bulletLines.map((line, i) => `${i + 1}. ${line}`).join("\n");
    const allContent = `
AI STORY SUMMARIZER CARD EXPORTS:
==================================
JOURNALIST: ${result.journalistName}
CATEGORY: ${result.category}
DATE GENERATED: ${new Date(result.createdAt).toLocaleString()}

3-LINE STORY SUMMARY:
${summaryStr}

PULL QUOTE:
${result.pullQuote}

SOCIAL CAPTION (PROFESSIONAL / TWITTER / LINKEDIN):
${result.caption1}

SOCIAL CAPTION (ENGAGING / FACEBOOK / INSTAGRAM):
${result.caption2}

SUGGESTED HASHTAGS:
${result.hashtags.split(",").join(" ")}
    `.trim();

    navigator.clipboard.writeText(allContent);
    triggerCopyNotify("all");
  };

  // Export TXT output file
  const handleExportTxt = () => {
    if (!result) return;
    const bulletLines = JSON.parse(result.summary);
    const summaryStr = bulletLines.map((line, i) => `${i + 1}. ${line}`).join("\n");
    const docText = `
AI Generated Social Story Card Report
--------------------------------------
Journalist: ${result.journalistName}
Category: ${result.category}
Created: ${new Date(result.createdAt).toLocaleString()}

--- 3-Line Story Summary ---
${summaryStr}

--- Highlighted Pull Quote ---
${result.pullQuote}

--- Social Media Captions ---
[Variant 1 - Professional (Twitter/LinkedIn)]
${result.caption1}

[Variant 2 - Engaging (Facebook/Instagram)]
${result.caption2}

--- Hashtags ---
${result.hashtags.split(",").join(" ")}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([docText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${result.category.toLowerCase()}_story_assets.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Export PDF with full aesthetics using jspdf
  const handleExportPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();

    // Custom coloring theme
    doc.setFillColor(15, 23, 42); // slate-950 dark background header
    doc.rect(0, 0, width, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("STORYCARD AI EXPORT REPORT", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(167, 139, 250); // purplish accent
    doc.text(`AUTOMATED SAAS OUTLINE`, 14, 25);
    
    doc.setTextColor(150, 150, 150);
    doc.text(`Journalist: ${result.journalistName}  |  Category: ${result.category}`, 14, 32);

    let currentY = 52;
    doc.setTextColor(15, 23, 42);

    // Section 1: 3-line summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. Concise Story Summaries", 14, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const bulletLines = JSON.parse(result.summary);
    bulletLines.forEach((line) => {
      const splitLine = doc.splitTextToSize(`• ${line}`, width - 28);
      doc.text(splitLine, 14, currentY);
      currentY += (splitLine.length * 6) + 2;
    });

    currentY += 6;

    // Section 2: Pull Quote
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Highlighted verbatim Pull Quote", 14, currentY);
    currentY += 8;

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10.5);
    doc.setTextColor(79, 70, 229); // indigo quote color

    const splitQuote = doc.splitTextToSize(`${result.pullQuote}`, width - 28);
    doc.text(splitQuote, 14, currentY);
    currentY += (splitQuote.length * 6) + 12;

    // Section 3: Professional Caption
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Twitter/LinkedIn Caption (Variant 1)", 14, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const splitCap1 = doc.splitTextToSize(result.caption1, width - 28);
    doc.text(splitCap1, 14, currentY);
    currentY += (splitCap1.length * 6) + 12;

    // Section 4: Instagram/Facebook Caption
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("4. Facebook/Instagram Caption (Variant 2)", 14, currentY);
    currentY += 8;

    const splitCap2 = doc.splitTextToSize(result.caption2, width - 28);
    doc.text(splitCap2, 14, currentY);
    currentY += (splitCap2.length * 6) + 12;

    // Section 5: Hashtags
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("5. Suggested Social hashtags", 14, currentY);
    currentY += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(139, 92, 246); // violet hashtags
    doc.text(result.hashtags.split(",").join("  "), 14, currentY);

    // Save
    doc.save(`${result.category.toLowerCase()}_social_report.pdf`);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Overview stats info block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/25 border border-slate-900 rounded-xl p-5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950/40 flex items-center justify-center text-purple-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-300 block">Live Authoring</span>
            <span>Assign matching reporter names</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-300 block">Factual Tone Guards</span>
            <span>Categorize by Politics, Sports, Tech</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-950/40 flex items-center justify-center text-pink-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-300 block">Gemini 2.5 Flash Engine</span>
            <span>Structured layouts processed instantly</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Form Inputs view panel */}
        <div className="w-full lg:w-[42%] bg-slate-900/60 p-6 md:p-8 rounded-2xl border border-white/[0.04] space-y-6 shrink-0 relative">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Story Parameters</h2>
            </div>
            <button 
              onClick={handleClear}
              className="text-slate-500 hover:text-red-400 transition-colors text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset inputs
            </button>
          </div>

          {error && (
            <div className="bg-red-950/45 border border-red-800/55 p-4 rounded-xl text-xs text-red-300 flex gap-2 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Journalist Name</label>
              <input 
                type="text"
                placeholder="e.g. Rachel Maddow, David Sanger"
                value={journalistName}
                onChange={(e) => setJournalistName(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-900 focus:border-purple-500/50 rounded-xl py-3 px-4 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-650"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Story Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-purple-950/40 border-purple-800 text-purple-300 shadow-sm"
                          : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Full Article Context</label>
                <div className="text-[10px] text-slate-500 font-mono">
                  {fullArticle.length} characters
                </div>
              </div>
              <textarea 
                placeholder="Paste the raw, full-text news story, press release, or document details here. Factual parameters will be analyzed and preserved by Namaste Telangana..."
                value={fullArticle}
                onChange={(e) => setFullArticle(e.target.value)}
                rows={10}
                className="w-full bg-slate-950/70 border border-slate-900 focus:border-purple-500/50 rounded-xl py-3 px-4 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-650 resize-y leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white transition-all rounded-xl py-3.5 text-xs font-bold font-sans tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10 hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Social Cards...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  Produce Story Cards
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Output preview card panel */}
        <div className="w-full lg:flex-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl"
              >
                {/* Clean loading animation */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-900 border-t-purple-600 animate-spin" />
                  <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-slate-200 text-sm font-semibold mb-2">Analyzing Article & Drafting Cards...</h3>
                <p className="text-slate-500 text-xs text-center max-w-sm px-6 leading-relaxed">
                  Gemini is summarizing key pointers, structuring Twitter threads, making Instagram caption drafts, and pulling highlight quotes.
                </p>
              </motion.div>
            ) : result ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Meta details & action export panel */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping" />
                    <div>
                      <span className="text-xs font-bold text-white block">Generation Complete!</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {result.id === -1 ? "Local Temp Saved" : `POSTGRES_#${result.id}`}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={handleCopyAll}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedField === "all" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-purple-400" /> Copy All
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleExportTxt}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" /> Txt Export
                    </button>
                    <button 
                      onClick={handleExportPdf}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-[10px] font-bold text-purple-300 hover:text-white hover:bg-purple-900 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-pink-400" /> Pdf Export
                    </button>
                  </div>
                </div>

                {/* 3-line Summary Card */}
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/[0.04] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900 font-mono">Summary</span>
                      <h3 className="text-xs font-bold text-white tracking-wide">3-Line Story Pointers</h3>
                    </div>
                    <button 
                      onClick={() => {
                        const parsed = JSON.parse(result.summary);
                        handleCopyText(parsed.join("\n"), "summary");
                      }}
                      className="p-1 px-2 rounded hover:bg-slate-950 text-slate-505 hover:text-purple-400 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedField === "summary" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <ul className="space-y-3.5 text-[11.5px] text-slate-350 leading-relaxed font-sans list-decimal list-inside pl-1 decoration-purple-500/40">
                    {JSON.parse(result.summary).map((line, idx) => (
                      <li key={idx} className="marker:text-purple-500 marker:font-bold">
                        <span className="pl-1.5">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pull Quote Card Container */}
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/[0.04] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-slate-900 border-l border-b border-white/[0.02] pointer-events-none">
                    <Quote className="w-16 h-16 opacity-10" />
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900 font-mono">Pull Quote</span>
                      <h3 className="text-xs font-bold text-white tracking-wide">verbatim Highlight</h3>
                    </div>
                    <button 
                      onClick={() => handleCopyText(result.pullQuote, "quote")}
                      className="p-1 px-2 rounded hover:bg-slate-950 text-slate-505 hover:text-purple-400 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedField === "quote" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 text-sm italic font-serif text-slate-200 leading-relaxed max-w-xl">
                    {result.pullQuote}
                  </blockquote>
                </div>

                {/* Captions Variant selector tab */}
                <div className="bg-slate-900/60 rounded-2xl border border-white/[0.04] overflow-hidden">
                  <div className="border-b border-slate-900 bg-slate-950/60 p-1.5 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setActiveCaptionTab("variant1")}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                          activeCaptionTab === "variant1"
                            ? "bg-purple-950/40 text-purple-300 border border-purple-900/40"
                            : "text-slate-505 hover:text-slate-300"
                        }`}
                      >
                        Variant 1 (Twitter/LinkedIn)
                      </button>
                      <button 
                        onClick={() => setActiveCaptionTab("variant2")}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                          activeCaptionTab === "variant2"
                            ? "bg-purple-950/40 text-purple-300 border border-purple-900/40"
                            : "text-slate-505 hover:text-slate-300"
                        }`}
                      >
                        Variant 2 (FB/Instagram)
                      </button>
                    </div>

                    <button 
                      onClick={() => handleCopyText(activeCaptionTab === "variant1" ? result.caption1 : result.caption2, "caption")}
                      className="p-1 px-3 rounded hover:bg-slate-950 text-slate-500 hover:text-purple-400 text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedField === "caption" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Caption</span>
                    </button>
                  </div>

                  <div className="p-6">
                    {activeCaptionTab === "variant1" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Twitter className="w-4.5 h-4.5 text-purple-400" />
                          <span className="text-[10px] font-bold text-slate-500 font-mono">Draft representation info card (Professional layout)</span>
                        </div>
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {result.caption1}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Facebook className="w-4.5 h-4.5 text-indigo-400" />
                          <span className="text-[10px] font-bold text-slate-505 font-mono">Draft representation info card (Conversational layout)</span>
                        </div>
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {result.caption2}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggested Tags */}
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/[0.04]">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-pink-950 text-pink-400 px-2 py-0.5 rounded border border-pink-900 font-mono">Hashtags</span>
                      <h3 className="text-xs font-bold text-white tracking-wide">Suggested Tags</h3>
                    </div>
                    <button 
                      onClick={() => handleCopyText(result.hashtags.split(",").join(" "), "tags")}
                      className="p-1 px-2 rounded hover:bg-slate-950 text-slate-505 hover:text-purple-400 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedField === "tags" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.hashtags.split(",").map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-purple-900/25 text-xs text-purple-300 font-semibold font-mono"
                      >
                        <Hash className="w-3 h-3 text-purple-500" /> {tag.replace("#", "")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating validation panel */}
                {result.id !== -1 && (
                  <div className="bg-gradient-to-r from-purple-950/15 to-indigo-950/15 p-5 rounded-2xl border border-purple-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold text-white block">Rate This Summary</span>
                      <span className="text-[11px] text-slate-400">Your feedback optimizes article indexing in the dashboard.</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = savedRating !== null ? star <= savedRating : (result.rating !== null && result.rating !== undefined ? star <= result.rating : false);
                        return (
                          <button
                            key={star}
                            onClick={() => handleRate(star)}
                            disabled={ratingLoading}
                            className="p-1 text-slate-500 hover:text-yellow-400 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Star className={`w-5 h-5 ${filled ? "text-yellow-400 fill-yellow-400 bg-transparent animate-pulse" : "text-slate-650 bg-transparent"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Secondary actions: Reset/Regenerate */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleGenerate}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition-all shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                    Regenerate Draft
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl px-6 text-center">
                <Sparkles className="w-10 h-10 text-slate-600 mb-4 animate-pulse" />
                <h3 className="text-slate-300 text-xs font-bold tracking-wide mb-1.5">No story produced yet</h3>
                <p className="text-slate-500 text-[11px] max-w-xs leading-relaxed">
                  Fill out the parameters form on the left, paste a news article, and click "Produce Story Cards" to trigger the process.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
