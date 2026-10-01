import React from "react";
import { Sparkles, Search, Bell, BookOpen } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            StudyBuddy<span className="text-indigo-600">.ai</span>
          </span>
        </div>

        {/* Center Search / Command Trigger */}
        <div className="hidden sm:flex items-center w-72 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-400 text-xs gap-2">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-slate-500">Quick search topics, algorithms...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-400 font-mono">⌘K</kbd>
        </div>

        {/* Right Action Icons & Avatar */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
            B
          </div>
        </div>

      </div>
    </header>
  );
}