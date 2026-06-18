import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Trash2, 
  Copy, 
  Eye, 
  Check, 
  Star, 
  Twitter, 
  Facebook, 
  X, 
  FileDown, 
  Clock, 
  User,
  Hash
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function HistoryView({ 
  historyList, 
  onDeleteItem, 
  onRateItem, 
  searchQuery, 
  token 
}) {
  // Modal drawer state
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedItemField, setCopiedItemField] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Process and Filter History list based on search queries
  const filteredList = historyList.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Search Category, Journalist, Article words, or Caption content
    return (
      item.journalistName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.fullArticle.toLowerCase().includes(query) ||
      item.caption1.toLowerCase().includes(query) ||
      item.caption2.toLowerCase().includes(query)
    );
  });

  const triggerCopyNotify = (field) => {
    setCopiedItemField(field);
    setTimeout(() => setCopiedItemField(null), 1800);
  };

  const handleCopyText = (textVal, key) => {
    navigator.clipboard.writeText(textVal);
    triggerCopyNotify(key);
  };

  const parseSummaryPreview = (summaryJson) => {
    try {
      const arr = JSON.parse(summaryJson);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr[0]; // Return the first line as preview
      }
      return typeof arr === "string" ? arr : "Summary preview unavailable";
    } catch {
      return summaryJson || "Summary preview unavailable";
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  // Export PDF from modal helper (uses the exact same robust pdf engine!)
  const handleExportPdf = (result) => {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();

    // Dark slate header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, width, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("STORYCARD AI HISTORIC REPORT", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(167, 139, 250);
    doc.text(`SAVED ARCHIVE ENTRY`, 14, 25);
    
    doc.setTextColor(150, 150, 150);
    doc.text(`Journalist: ${result.journalistName}  |  Category: ${result.category}`, 14, 32);

    let currentY = 52;
    doc.setTextColor(15, 23, 42);

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. Concise Story Pointers", 14, currentY);
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

    // Quote
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("2. verbatim Highlight", 14, currentY);
    currentY += 8;

    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10.5);
    doc.setTextColor(79, 70, 229);

    const splitQuote = doc.splitTextToSize(`${result.pullQuote}`, width - 28);
    doc.text(splitQuote, 14, currentY);
    currentY += (splitQuote.length * 6) + 12;

    // Cap 1
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

    // Cap 2
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("4. Facebook/Instagram Caption (Variant 2)", 14, currentY);
    currentY += 8;

    const splitCap2 = doc.splitTextToSize(result.caption2, width - 28);
    doc.text(splitCap2, 14, currentY);
    currentY += (splitCap2.length * 6) + 12;

    // Tags
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("5. Suggested Social hashtags", 14, currentY);
    currentY += 7;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 92, 246);
    doc.text(result.hashtags.split(",").join("  "), 14, currentY);

    doc.save(`${result.category}_archive_${result.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Search status for filtering feedback */}
      {searchQuery && (
        <div className="text-xs text-slate-400">
          Filtered list down to <span className="text-purple-400 font-bold">{filteredList.length}</span> matching entries out of <span className="text-slate-200 font-bold">{historyList.length}</span> total generations.
        </div>
      )}

      {/* Main Table Layout */}
      <div className="bg-slate-900/40 rounded-2xl border border-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4.5 px-6">Generated Date</th>
                <th className="py-4.5 px-5">Journalist / Author</th>
                <th className="py-4.5 px-5">Story Category</th>
                <th className="py-4.5 px-5 max-w-sm">Summary Line Preview</th>
                <th className="py-4.5 px-5 text-center">Quality Rating</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <Clock className="w-10 h-10 text-slate-700 mb-4 animate-pulse" />
                      <span className="text-slate-300 text-xs font-bold block mb-1">No historical assets found</span>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        {searchQuery 
                          ? "We couldn't find matches for this query. Refining your letters or click the Clear search."
                          : "Any summaries you generate using the parameters form will be saved securely here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-900/25 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-4.5 px-6 text-slate-300 font-medium shrink-0 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </td>

                    {/* Journalist */}
                    <td className="py-4.5 px-5 text-white font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-center text-[9px] font-bold text-purple-300">
                          {item.journalistName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[130px]">{item.journalistName}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4.5 px-5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide border ${
                        item.category === "Politics" ? "bg-amber-950/25 border-amber-900/45 text-amber-400" :
                        item.category === "Sports" ? "bg-indigo-950/25 border-indigo-900/44 text-indigo-400" :
                        item.category === "Entertainment" ? "bg-pink-950/25 border-pink-900/44 text-pink-400" :
                        item.category === "Technology" ? "bg-purple-950/25 border-purple-900/45 text-purple-400" :
                        item.category === "Business" ? "bg-emerald-950/25 border-emerald-900/44 text-emerald-400" :
                        "bg-teal-950/25 border-teal-900/44 text-teal-400"
                      }`}>
                        {item.category}
                      </span>
                    </td>

                    {/* Summary Preview */}
                    <td className="py-4.5 px-5 max-w-sm">
                      <p className="text-slate-400 line-clamp-1 truncate select-none leading-relaxed">
                        {parseSummaryPreview(item.summary)}
                      </p>
                    </td>

                    {/* Rating stars */}
                    <td className="py-4.5 px-5 text-center whitespace-nowrap select-none">
                      <div className="inline-flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onRateItem(item.id, star)}
                            className="p-0.5 text-slate-500 hover:text-yellow-400 transition-all cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${
                              item.rating !== null && item.rating >= star 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-slate-700"
                            }`} />
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Actions dropdown/buttons */}
                    <td className="py-4.5 px-6 text-right whitespace-nowrap">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center justify-end gap-2 text-[10px]">
                          <span className="text-red-400 font-serif">Sure?</span>
                          <button 
                            onClick={() => { onDeleteItem(item.id); setDeleteConfirmId(null); }}
                            className="px-2 py-1 bg-red-950 text-red-400 border border-red-900 rounded font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-800 rounded font-bold uppercase tracking-wider cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-purple-400 hover:border-purple-950 transition-colors cursor-pointer"
                            title="View Generated Assets"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const bulletLines = JSON.parse(item.summary);
                              handleCopyText(bulletLines.join("\n"), `row_${item.id}`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-indigo-400 hover:border-indigo-950 transition-colors cursor-pointer"
                            title="Copy Summary Lines"
                          >
                            {copiedItemField === `row_${item.id}` ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-red-400 hover:border-red-950 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Viewer Modal/Drawer (Sliding entry!) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-950 cursor-pointer"
            />

            {/* Sliding Drawer Body */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="relative w-full max-w-xl bg-slate-950 border-l border-slate-900 h-full flex flex-col shadow-2xl text-slate-100 z-10"
            >
              {/* Header */}
              <div className="h-16 px-6 border-b border-slate-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded bg-purple-950 border border-purple-900/60 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <h3 className="font-bold text-sm tracking-wide text-white">Full Social Asset Preview</h3>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 -mr-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrolling Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-7">
                {/* Journalist details tag */}
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900/20 p-3 rounded-xl border border-slate-900/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Journalist: <span className="text-white font-semibold">{selectedItem.journalistName}</span></span>
                  </div>
                  <div>
                    <span>Category: <span className="text-white font-semibold font-mono text-[10px] uppercase">{selectedItem.category}</span></span>
                  </div>
                </div>

                {/* 3 point summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-900 pb-2">
                    <span>3 Concise Summary Lines</span>
                    <button 
                      onClick={() => {
                        const arr = JSON.parse(selectedItem.summary);
                        handleCopyText(arr.join("\n"), "modal_sum");
                      }}
                      className="text-[10px] text-slate-500 hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedItemField === "modal_sum" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Pointers</span>
                    </button>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300 leading-relaxed list-inside list-disc decoration-indigo-500">
                    {JSON.parse(selectedItem.summary).map((line, i) => (
                      <li key={i} className="marker:text-indigo-500">
                        <span className="pl-1 leading-normal">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pull Quote */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-900 pb-2">
                    <span>Highlighted Pull Quote</span>
                    <button 
                      onClick={() => handleCopyText(selectedItem.pullQuote, "modal_quote")}
                      className="text-[10px] text-slate-500 hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedItemField === "modal_quote" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <blockquote className="border-l-4 border-purple-500 pl-4 py-1 text-xs italic font-serif text-slate-300 leading-relaxed">
                    {selectedItem.pullQuote}
                  </blockquote>
                </div>

                {/* Captions Variant 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-900 pb-2">
                    <span className="flex items-center gap-1.5"><Twitter className="w-4 h-4 text-purple-400" /> Professional (Twitter/LinkedIn)</span>
                    <button 
                      onClick={() => handleCopyText(selectedItem.caption1, "modal_cap1")}
                      className="text-[10px] text-slate-500 hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedItemField === "modal_cap1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Caption</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                    {selectedItem.caption1}
                  </div>
                </div>

                {/* Captions Variant 2 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-900 pb-2">
                    <span className="flex items-center gap-1.5"><Facebook className="w-4 h-4 text-indigo-400" /> Engaging (FB/Instagram)</span>
                    <button 
                      onClick={() => handleCopyText(selectedItem.caption2, "modal_cap2")}
                      className="text-[10px] text-slate-500 hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedItemField === "modal_cap2" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Caption</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.caption2}
                  </div>
                </div>

                {/* Suggested Tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-900 pb-2">
                    <span>Suggested Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {selectedItem.hashtags.split(",").map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-purple-400 font-mono font-medium"
                      >
                        <Hash className="w-3 h-3 text-purple-500" /> {tag.replace("#", "")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer exports */}
              <div className="h-20 px-6 border-t border-slate-900 bg-slate-950 flex items-center justify-between gap-4 shrink-0">
                <span className="text-[10px] text-slate-500 font-mono">Registered Entry: {formatDate(selectedItem.createdAt)}</span>
                <button
                  onClick={() => handleExportPdf(selectedItem)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" /> Download PDF Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
