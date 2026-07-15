import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-grow pt-16 relative flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Learn Anything. Keep going.</p>
        </div>
      </footer>
    </div>
  );
}