import React from 'react';
import { Sparkles, Plus, History, Library, FileEdit } from 'lucide-react';

interface NavbarProps {
  currentTab: 'hub' | 'generator' | 'builder' | 'history';
  onSelectTab: (tab: 'hub' | 'generator' | 'builder' | 'history') => void;
  onOpenGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenGenerator }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button 
            onClick={() => onSelectTab('hub')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Vantage TestPrep
            </span>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => onSelectTab('hub')}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'hub' 
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]' 
                  : 'hover:text-slate-900'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Exam Library</span>
            </button>

            <button 
              onClick={() => onSelectTab('generator')}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'generator' 
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]' 
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Test Generator</span>
            </button>

            <button 
              onClick={() => onSelectTab('builder')}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'builder' 
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]' 
                  : 'hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>Quiz Creator</span>
            </button>

            <button 
              onClick={() => onSelectTab('history')}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'history' 
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 -mb-[2px]' 
                  : 'hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Score History</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Dynamic Mock</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
