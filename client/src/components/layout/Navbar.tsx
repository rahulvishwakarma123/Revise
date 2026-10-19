import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Sun,
  Moon,
  Database,
  Download,
  HardDrive,
} from 'lucide-react';
import { ExportImportModal } from '../common/ExportImportModal';

export const Navbar: React.FC = () => {
  const {
    isBackendConnected,
    searchQuery,
    setSearchQuery,
    stats,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between gap-4 transition-colors">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md text-primary-foreground font-black text-xl">
            Ω
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base lg:text-lg text-foreground tracking-tight">
                Project Revise
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                Active Recall & Spaced Repetition
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Portfolio DSA Tracking System • MERN Stack
            </p>
          </div>
        </div>

        {/* Middle: Universal Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patterns (e.g. Sliding window, Kadane, Kahn, LCS)..."
              className="w-full bg-background border border-border text-foreground text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs px-1.5 py-0.5 rounded"
              >
                esc
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Sync Status Badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
              isBackendConnected
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'bg-sky-500/10 text-sky-500 border-sky-500/30'
            }`}
            title={
              isBackendConnected
                ? 'Connected to local MongoDB (mongodb://127.0.0.1:27017)'
                : 'Operating in Offline-First mode with LocalStorage persistence'
            }
          >
            {isBackendConnected ? (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>MongoDB Connected</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local Storage Active</span>
              </>
            )}
          </div>

          {/* Export / Backup Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors"
            title="Backup & Restore Data"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-all hover:scale-105"
            title={`Current theme: ${theme}. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Streak indicator pill */}
          {stats && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono text-xs font-semibold">
              <span>🔥</span>
              <span>{stats.currentStreak}d</span>
            </div>
          )}
        </div>
      </header>

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </>
  );
};
