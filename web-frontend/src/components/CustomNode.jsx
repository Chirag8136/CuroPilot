import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, BookOpen, Video, Wrench } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export default function CustomNode({ data, id }) {
  const { completedNodes } = useRoadmap();
  const isCompleted = completedNodes.includes(id);

  return (
    <div
      className={`w-64 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
        isCompleted
          ? 'bg-slate-50 border-slate-200 opacity-70'
          : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-300 !w-2 !h-2" />

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`font-semibold text-sm ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {data.title}
        </h3>
        {isCompleted && <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />}
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{data.description}</p>

      <div className="flex items-center gap-2.5 text-slate-300">
        <BookOpen size={13} />
        <Video size={13} />
        <Wrench size={13} />
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-300 !w-2 !h-2" />
    </div>
  );
}