import React, { useEffect, useState } from 'react';
import { useRoadmap } from '../context/RoadmapContext';
import { X, BookOpen, PlayCircle, Terminal, Clock, CheckCircle2, Circle } from 'lucide-react';

const ResourceCard = ({ title, url, icon: Icon, colorClass }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group shadow-sm"
  >
    <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 shadow-inner ${colorClass}`}>
      <Icon size={18} />
    </div>
    <span className="text-sm font-medium text-slate-300 group-hover:text-white line-clamp-2 flex-1">
      {title}
    </span>
  </a>
);

export default function Sidebar() {
  const { activeNode, setActiveNode, toggleNodeCompletion, completedNodes } = useRoadmap();
  const [nodeData, setNodeData] = useState(null);

  // Preserve node data for smooth closing animation without crashing
  useEffect(() => {
    if (activeNode) {
      setNodeData(activeNode);
    }
  }, [activeNode]);

  const isOpen = !!activeNode;

  if (!nodeData) return null;

  const isCompleted = completedNodes.includes(nodeData.id);

  let difficultyColors = 'bg-slate-800 text-slate-300 border-slate-700';
  if (nodeData.difficulty === 'Beginner') {
    difficultyColors = 'bg-green-500/10 text-green-400 border-green-500/20';
  } else if (nodeData.difficulty === 'Intermediate') {
    difficultyColors = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  } else if (nodeData.difficulty === 'Advanced') {
    difficultyColors = 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  return (
    <div 
      className={`fixed md:absolute md:top-0 md:right-0 bottom-0 left-0 md:left-auto md:h-full w-full md:w-[450px] h-[85vh] md:h-full rounded-t-3xl md:rounded-none bg-slate-900/95 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] md:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${
        isOpen 
          ? 'translate-y-0 md:translate-y-0 md:translate-x-0' 
          : 'translate-y-full md:translate-y-0 md:translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight flex-1 pr-4">{nodeData.title}</h2>
        <button 
          onClick={() => setActiveNode(null)}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Meta Info */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${difficultyColors}`}>
            {nodeData.difficulty}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            <Clock size={14} />
            {nodeData.estimatedTime}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Overview</h3>
          <p className="text-slate-300 leading-relaxed text-sm">
            {nodeData.description}
          </p>
        </div>

        {/* Mini Project */}
        {nodeData.project && (
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Terminal size={64} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-2">
                <Terminal size={14} />
                Mini Project Challenge
              </h3>
              <h4 className="text-white font-semibold mb-2">{nodeData.project.title}</h4>
              <p className="text-sm text-cyan-100/70">{nodeData.project.description}</p>
            </div>
          </div>
        )}

        {/* Resources */}
        {nodeData.resources && (
          <div className="space-y-6">
            {nodeData.resources.reading && nodeData.resources.reading.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <BookOpen size={16} />
                  Documentation & Readings
                </h3>
                <div className="space-y-2">
                  {nodeData.resources.reading.map((res, i) => (
                    <ResourceCard key={i} title={res.title} url={res.url} icon={BookOpen} colorClass="text-blue-400" />
                  ))}
                </div>
              </div>
            )}

            {nodeData.resources.youtube && nodeData.resources.youtube.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <PlayCircle size={16} />
                  Video Lectures
                </h3>
                <div className="space-y-2">
                  {nodeData.resources.youtube.map((res, i) => (
                    <ResourceCard key={i} title={res.title} url={res.url} icon={PlayCircle} colorClass="text-red-400" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
        <button
          onClick={() => toggleNodeCompletion(nodeData.id)}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
            isCompleted 
              ? 'bg-slate-800 hover:bg-slate-700 text-green-400 border border-green-500/30 hover:border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-400/20'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={22} className="animate-in zoom-in duration-300" />
              Completed Path
            </>
          ) : (
            <>
              <Circle size={22} />
              Mark Node as Complete
            </>
          )}
        </button>
      </div>

    </div>
  );
}
