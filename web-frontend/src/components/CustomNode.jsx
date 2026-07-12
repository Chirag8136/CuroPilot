import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2 } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export default function CustomNode({ data, id }) {
  const { completedNodes } = useRoadmap();
  const isCompleted = completedNodes.includes(id);

  let difficultyColor = 'border-slate-600 shadow-[0_0_10px_rgba(71,85,105,0.3)]';
  if (data.difficulty === 'Beginner') {
    difficultyColor = 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
  } else if (data.difficulty === 'Intermediate') {
    difficultyColor = 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
  } else if (data.difficulty === 'Advanced') {
    difficultyColor = 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
  }

  const wrapperClasses = isCompleted 
    ? 'bg-slate-800 border-slate-700 opacity-60' 
    : `bg-slate-900/80 ${difficultyColor}`;

  const titleClasses = isCompleted ? 'text-slate-500 line-through' : 'text-slate-100';

  return (
    <div className={`w-[250px] p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${wrapperClasses}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-500 border-none" />
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${titleClasses}`}>{data.title}</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{data.description}</p>
        </div>
        
        {isCompleted && (
          <div className="text-green-500 flex-shrink-0 animate-in zoom-in duration-300">
            <CheckCircle2 size={20} />
          </div>
        )}
      </div>
      
      {!isCompleted && (
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${
            data.difficulty === 'Beginner' ? 'text-green-400' :
            data.difficulty === 'Intermediate' ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {data.difficulty}
          </span>
          <span className="text-[10px] text-slate-500">{data.estimatedTime}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-500 border-none" />
    </div>
  );
}
