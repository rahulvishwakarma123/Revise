import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  BookOpen,
  CalendarDays,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: stats?.patternsDueTodayCount ? `${stats.patternsDueTodayCount} due` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    },
    {
      id: 'roadmap',
      label: 'DSA Roadmap',
      icon: Compass,
      badge: `${stats?.totalPatterns ?? 0}`,
      badgeColor: 'bg-primary/20 text-primary border-primary/30',
    },
    {
      id: 'problems',
      label: 'Problem Tracker',
      icon: CheckSquare,
      badge: `${stats?.totalProblems || 0}`,
      badgeColor: 'bg-secondary text-secondary-foreground border-border',
    },
    {
      id: 'mistakes',
      label: 'Mistake Journal',
      icon: BookOpen,
      badge: `${stats?.totalMistakes || 0}`,
      badgeColor: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    },
    {
      id: 'scheduler',
      label: 'Revision Schedule',
      icon: CalendarDays,
      badge: 'Spaced',
      badgeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] transition-colors">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md font-semibold'
                    : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Spaced repetition rule cheat box */}
        <div className="p-3.5 rounded-xl bg-card border border-border text-[11px] space-y-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spaced Intervals</span>
          </div>
          <div className="space-y-1.5 text-muted-foreground font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-rose-500 font-medium">Could not solve:</span>
              <span className="text-foreground">Tomorrow (1d)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-500 font-medium">Solved w/ hint:</span>
              <span className="text-foreground">In 2–3 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-500 font-medium">Independent:</span>
              <span className="text-foreground">In 7 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary font-medium">Consistently strong:</span>
              <span className="text-foreground">14–30+ days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer: External reference */}
      <div className="p-4 border-t border-sidebar-border">
        <a
          href="https://dsamindmap.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border text-xs"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>DSA MindMap Ref</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </a>
      </div>
    </aside>
  );
};
