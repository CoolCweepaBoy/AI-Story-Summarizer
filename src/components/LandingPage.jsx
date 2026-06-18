import { motion } from "motion/react";
import { 
  Sparkles, 
  Quote, 
  Share2, 
  History, 
  BarChart3, 
  ArrowRight, 
  Menu, 
  X, 
  Layers 
} from "lucide-react";
import { useState } from "react";
import NamasteTelanganaLogo from "./NamasteTelanganaLogo";

export default function LandingPage({ onGetStarted, onLoginClick, onRegisterClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      title: "AI Summary Generation",
      description: "Instantly condense full-length articles into exactly 3 punchy, fact-rich summary bullet points."
    },
    {
      icon: <Quote className="w-5 h-5 text-indigo-400" />,
      title: "Pull Quote Extraction",
      description: "Detect and isolate the most memorable and high-impact verbatim quotes from content."
    },
    {
      icon: <Share2 className="w-5 h-5 text-pink-400" />,
      title: "Social Media Captions",
      description: "Generate professional Twitter/LinkedIn copy alongside highly engaging Instagram captions."
    },
    {
      icon: <Layers className="w-5 h-5 text-violet-400" />,
      title: "Multi-Platform Formats",
      description: "Tailor suggestions by structural categories, matching the perfect vocabulary per sector."
    },
    {
      icon: <History className="w-5 h-5 text-teal-400" />,
      title: "History tracking",
      description: "Retrieve past stories anytime, check editorial rating status, and copy assets on demand."
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-rose-400" />,
      title: "Analytics Dashboard",
      description: "Monitor team generation throughput, rated performance metrics, and top editorial categories."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <NamasteTelanganaLogo size="md" showSubtitle={true} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={onRegisterClick}
              className="text-sm font-medium px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-white transition-all cursor-pointer shadow-sm hover:shadow-purple-500/5 hover:-translate-y-0.5"
            >
              Request Access
            </button>
            <button 
              onClick={onGetStarted}
              className="text-sm font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/10 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900/60 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-b border-slate-900 bg-slate-950 px-4 pt-2 pb-6 flex flex-col gap-4"
          >
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm py-2 text-slate-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm py-2 text-slate-400 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <hr className="border-slate-900" />
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-lg border border-slate-900"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                className="w-full text-center py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/55 border border-purple-800/40 text-xs font-semibold text-purple-300 mb-6 tracking-wide"
        >
          <Sparkles className="w-3.5 h-3.5" /> Newsroom Automation Suite
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6"
        >
          Transform News Articles into <br className="hidden sm:inline" />
          <span className="gradient-text">Social Media Cards</span> Instantly
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Generate editorial summaries, extract verbatim pull quotes, formulate platform-optimized captions, and suggesting trending hashtags powered by Gemini.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
          <a 
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold transition-all flex items-center justify-center"
          >
            Watch Demo
          </a>
        </motion.div>

        {/* Dashboard Preview mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl rounded-2xl glass-panel p-2 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/60 border-b border-slate-800 flex items-center px-4 gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/85 block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/85 block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/85 block" />
            <span className="text-xs text-slate-500 font-mono ml-4">https://storycard-ai.newsroom/dashboard</span>
          </div>
          <div className="pt-10 pb-6 px-4 md:px-8 bg-slate-950/40 rounded-xl flex flex-col md:flex-row gap-6">
            {/* Input mock */}
            <div className="flex-1 text-left bg-slate-900/40 border border-white/[0.03] p-4 rounded-lg">
              <span className="text-xs font-semibold text-purple-400 block mb-2 font-mono">STEP 1: PASTE ARTICLE</span>
              <div className="h-4 w-4/5 bg-slate-800 rounded mb-2.5" />
              <div className="h-3 w-11/12 bg-slate-800/60 rounded mb-2" />
              <div className="h-3 w-full bg-slate-800/60 rounded mb-2" />
              <div className="h-3 w-3/4 bg-slate-800/60 rounded mb-5" />
              <div className="h-9 w-full bg-purple-600/35 rounded-lg border border-purple-500/30 flex items-center justify-center text-xs font-semibold text-purple-200">
                PRODUCING SOCIAL ASSETS...
              </div>
            </div>
            {/* Preview mock */}
            <div className="flex-1 text-left bg-slate-900/60 border border-white/[0.05] p-5 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-400 block mb-2.5 font-mono">STEP 2: PRESERVED OUTPUTS</span>
                <div className="space-y-2 mb-4">
                  <div className="h-2.5 w-full bg-slate-800 rounded" />
                  <div className="h-2.5 w-11/12 bg-slate-800 rounded" />
                  <div className="h-2.5 w-10/12 bg-slate-800 rounded" />
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border-l-2 border-indigo-500 mb-3 font-serif italic text-xs text-slate-300">
                  "Generative summary extraction automates up to 90% of news caption preparation routines."
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-900 text-slate-400">#AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-900 text-slate-400">#NEWSROOM</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-900 text-slate-400">#AUTOMATION</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4 sm:text-4xl">
              Professional Tools for Digital Editors
            </h2>
            <p className="text-base text-slate-400">
              A comprehensive toolkit customized for journalists, editors, and social media managers who require speed, precision, and tone consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="glass-card hover:bg-slate-900/45 p-6 rounded-2xl hover:border-purple-500/20 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4 sm:text-4xl">
              From Article to Publish Ready in Seconds
            </h2>
            <p className="text-base text-slate-400">
              The fastest operational layout from raw transcripts, press reports, or full articles to social cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-purple-500/5">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Paste Article</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Inputs reporter's name, assign news category, and paste the full article copy.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-indigo-500/5">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Processing</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Gemini structures high-integrity summaries and extracts precise keywords in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-pink-950 border border-pink-800 text-pink-300 flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-pink-500/5">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Review Outputs</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Check and audit summary bullet points, highlight tags, and captions layout side-by-side.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-teal-950 border border-teal-800 text-teal-300 flex items-center justify-center font-bold text-lg mb-6 shadow-lg shadow-teal-500/5">
                04
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Copy or Export</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Copy text fields to clipboard or instantly export structured story content as TXT or PDF formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:flex md:justify-between md:items-center">
          <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
            <NamasteTelanganaLogo size="sm" showSubtitle={false} />
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 mb-4 md:mb-0">
            <a href="#" className="hover:text-slate-350 transition-colors">About</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Contact</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
          </div>

          <p className="text-xs text-slate-600 leading-normal">
            &copy; 2026 Namaste Telangana. All rights reserved. Built for newsroom agility.
          </p>
        </div>
      </footer>
    </div>
  );
}
