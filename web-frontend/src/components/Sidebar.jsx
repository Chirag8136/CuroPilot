import React from 'react';
import { X, BookOpen, Video, Wrench, CheckCircle2, Circle } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export default function Sidebar() {
  const { activeNode, setActiveNode, completedNodes, toggleNodeCompletion } = useRoadmap();

  if (!activeNode) return null;

  const isCompleted = completedNodes.includes(activeNode.id);

  const resources = [
    { icon: BookOpen, label: 'Reading', value: activeNode.reading },
    { icon: Video, label: 'Watch', value: activeNode.youtube },
    { icon: Wrench, label: 'Build', value: activeNode.project },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40"
        onClick={() => setActiveNode(null)}
      />
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in">
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-500 mb-1">
              Step {activeNode.id}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">{activeNode.title}</h2>
          </div>
          <button
            onClick={() => setActiveNode(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">{activeNode.description}</p>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resources</h3>
            {resources.map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={14} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">{label}</span>
                </div>
                <p className="text-sm text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={() => toggleNodeCompletion(activeNode.id)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {isCompleted ? 'Marked as complete' : 'Mark as complete'}
          </button>
        </div>
      </aside>
    </>
  );
}