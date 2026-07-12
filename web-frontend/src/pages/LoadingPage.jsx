import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../context/RoadmapContext';
import { Loader2 } from 'lucide-react';

export default function LoadingPage() {
  const { currentTopic, roadmapData } = useRoadmap();
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);

  const displayTopic = currentTopic || 'the requested topic';

  const phrases = [
    `Analyzing core syntax for ${displayTopic}...`,
    "Structuring optimal learning nodes...",
    "Curating high-signal documentation and video resources...",
    "Compiling custom mini-project sandboxes..."
  ];

  useEffect(() => {
    // Cycle text every 500ms
    const intervalId = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % 4);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Monitor context state and route when populated
    if (roadmapData) {
      // Generate the URL friendly slug or fallback to machine-learning as requested
      const path = currentTopic 
        ? currentTopic.toLowerCase().replace(/\s+/g, '-')
        : 'machine-learning';
        
      navigate(`/roadmap/${path}`);
    }
  }, [roadmapData, navigate, currentTopic]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      
      <div className="relative mb-12">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-tr from-fuchsia-500 to-blue-500 opacity-40 animate-pulse"></div>
        {/* Spinner */}
        <Loader2 size={96} strokeWidth={1.5} className="animate-spin text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
      </div>
      
      {/* Dynamic Animated Text Cycler */}
      <div className="h-16 flex items-center justify-center text-center max-w-2xl px-4">
        <h2 
          key={phraseIndex} // Force re-render animation on index change
          className="text-xl md:text-2xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 animate-in fade-in zoom-in-95 duration-300"
        >
          {phrases[phraseIndex]}
        </h2>
      </div>

    </div>
  );
}
