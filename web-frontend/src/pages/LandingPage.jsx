import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../context/RoadmapContext';
import { Sparkles, Search, ArrowRight, Zap } from 'lucide-react';

const SUGGESTED_TOPICS = [
  "Machine Learning",
  "Quantum Physics",
  "Chess Strategy",
  "UX Design"
];

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { fetchRoadmap } = useRoadmap();

  const handleGenerate = (topicToGenerate) => {
    if (!topicToGenerate.trim()) return;
    
    // Trigger the context action
    fetchRoadmap(topicToGenerate);
    // Immediately route to the loading screen
    navigate('/loading');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGenerate(query);
  };

  const handlePillClick = (topic) => {
    setQuery(topic);
    handleGenerate(topic); // Clicking pill automatically triggers it
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden animate-in fade-in duration-700 w-full max-w-7xl mx-auto">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-fuchsia-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-blue-500/10 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-fuchsia-600/20 to-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 text-center mb-10 w-full max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-sm text-slate-300 mb-8 backdrop-blur-md shadow-xl">
          <Zap size={16} className="text-yellow-400" />
          <span>AI-Powered Learning Paths</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Learn <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 drop-shadow-sm">
            Literally Anything
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Enter a topic you want to master. Our AI engine will generate a hyper-optimized, interactive roadmap tailored for you.
        </p>
      </div>

      {/* Search Bar Wrapper */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mb-10">
        <div className={`absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-2xl blur opacity-25 transition duration-500 ${isFocused ? 'opacity-50 blur-md' : ''}`}></div>
        
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center p-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all"
        >
          <div className="pl-4 pr-2 text-slate-400">
            <Search size={24} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What do you want to learn today?"
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-500 px-2 h-14"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">Generate Roadmap</span>
          </button>
        </form>
      </div>

      {/* Suggested Topics Pills */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Trending Paths</span>
        <div className="flex flex-wrap gap-3 justify-center">
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => handlePillClick(topic)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 backdrop-blur-md text-sm text-slate-300 hover:text-white transition-all group"
            >
              {topic}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
