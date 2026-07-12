import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30">
      
      {/* Functional Navbar Component */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow pt-16 relative flex flex-col">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Nexus Platform. All systems operational.</p>
        </div>
      </footer>
    </div>
  );
}
