import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export default function Navbar() {
  const { roadmapData, completedNodes } = useRoadmap();
  
  let progress = 0;
  let level = 1;

  if (roadmapData && roadmapData.nodes && roadmapData.nodes.length > 0) {
    // Only count completed nodes that actually exist in the current roadmap
    const roadmapNodeIds = roadmapData.nodes.map(n => n.id);
    const validCompleted = completedNodes.filter(id => roadmapNodeIds.includes(id));
    
    progress = (validCompleted.length / roadmapData.nodes.length) * 100;
    
    // Level scaling: Max level based on chunks of 10% progress. (e.g. 100% = Level 11, etc)
    level = Math.floor((progress / 100) * 10) + 1;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 text-white group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-shadow duration-300">
            <Activity size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Nexus
          </span>
        </Link>

        {/* Dynamic Progress Bar */}
        {roadmapData ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:inline-block">
              Level {level}
            </span>
            <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-slate-400 sm:hidden">
              {Math.round(progress)}%
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3 opacity-30 grayscale">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Level 1</span>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden"></div>
          </div>
        )}

      </div>
    </header>
  );
}
