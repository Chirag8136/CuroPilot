import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmap } from '../context/RoadmapContext';

export default function LoadingPage() {
  const { currentTopic, roadmapData } = useRoadmap();
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);

  const displayTopic = currentTopic || 'your topic';

  const phrases = [
    `Analyzing core concepts for ${displayTopic}...`,
    'Structuring optimal learning steps...',
    'Curating reading and video resources...',
    'Assembling hands-on project ideas...',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 1800);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (roadmapData) {
      const path = currentTopic ? currentTopic.toLowerCase().replace(/\s+/g, '-') : 'topic';
      navigate(`/roadmap/${path}`);
    }
  }, [roadmapData, navigate, currentTopic]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <p className="text-sm text-slate-500 mb-10 h-6">{phrases[phraseIndex]}</p>

      <div className="flex items-center gap-8 overflow-hidden max-w-full px-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-8">
            <div className="w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
              <div className="h-2.5 w-14 bg-slate-200 rounded mb-3" />
              <div className="h-3.5 w-4/5 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-full bg-slate-100 rounded mb-1.5" />
              <div className="h-3 w-3/5 bg-slate-100 rounded" />
            </div>
            {i < 3 && <div className="w-8 h-px bg-slate-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}