import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../context/RoadmapContext';
import { Sparkles, Search, ArrowRight } from 'lucide-react';

const SUGGESTED_TOPICS = ['Machine Learning', 'Quantum Physics', 'Chess Strategy', 'UX Design'];

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { fetchRoadmap } = useRoadmap();

  const handleGenerate = (topicToGenerate) => {
    if (!topicToGenerate.trim()) return;
    fetchRoadmap(topicToGenerate);
    navigate('/loading');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGenerate(query);
  };

  const handlePillClick = (topic) => {
    setQuery(topic);
    handleGenerate(topic);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-6">
          <Sparkles size={14} />
          AI-Powered Learning Paths
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
          What do you want to master?
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          Enter any topic and get a personalized, step-by-step learning roadmap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative w-full mb-6">
        <div className="flex items-center p-2 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
          <div className="pl-3 pr-2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Machine Learning, Guitar, Quantum Physics..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 text-base placeholder:text-slate-400 h-12"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:bg-slate-200 disabled:text-slate-400"
          >
            Generate
          </button>
        </div>
      </form>

      <div className="flex flex-col items-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-3">
          Trending Paths
        </span>
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => handlePillClick(topic)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors group"
            >
              {topic}
              <ArrowRight
                size={14}
                className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}