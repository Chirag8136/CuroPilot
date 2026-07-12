import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-cyan-500/20 mb-6 relative">
        <AlertTriangle size={120} strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center text-cyan-500 font-bold text-2xl">
          404
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white">Signal Lost</h1>
      <p className="text-slate-400 max-w-md mb-8">
        The sector you are trying to reach does not exist in our current coordinates. 
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700"
      >
        Return to Base
      </Link>
    </div>
  );
}
