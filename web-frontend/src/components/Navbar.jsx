import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export default function Navbar() {
  const { roadmapData, completedNodes } = useRoadmap();

  let progress = 0;

  if (roadmapData?.nodes?.length > 0) {
    const roadmapNodeIds = roadmapData.nodes.map((n) => n.id);
    const validCompleted = completedNodes.filter((id) => roadmapNodeIds.includes(id));
    progress = (validCompleted.length / roadmapData.nodes.length) * 100;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-indigo-600 text-white group-hover:bg-indigo-700 transition-colors">
            <Sparkles size={18} />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900">
            Learn Anything
          </span>
        </Link>

        {roadmapData && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">
              {Math.round(progress)}% complete
            </span>
            <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}