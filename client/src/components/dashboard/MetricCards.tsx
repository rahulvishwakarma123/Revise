import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Calendar,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { stats, setActiveTab } = useApp();

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Patterns',
      value: stats.totalPatterns,
      subtext: 'Organized from DSA MindMap',
      icon: Compass,
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/20',
      action: () => setActiveTab('roadmap'),
    },
    {
      title: 'Revised This Week',
      value: stats.patternsRevisedThisWeek,
      subtext: 'Active recall retention cycle',
      icon: Calendar,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      action: () => setActiveTab('scheduler'),
    },
    {
      title: 'Patterns Due Today',
      value: stats.patternsDueTodayCount,
      subtext: stats.patternsDueTodayCount > 0 ? 'Requires revision today!' : 'All caught up!',
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      highlight: stats.patternsDueTodayCount > 0,
      action: () => {
        if (stats.patternsDueTodayList.length > 0) {
          setActiveTab('scheduler');
        }
      },
    },
    {
      title: 'Weak Patterns',
      value: stats.weakPatterns,
      subtext: 'Need spaced reinforcement',
      icon: ShieldAlert,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      action: () => setActiveTab('roadmap'),
    },
    {
      title: 'Solved Independently',
      value: stats.independentProblems,
      subtext: `${stats.totalProblems} total problems tracked`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => setActiveTab('problems'),
    },
    {
      title: 'Interview Mastery',
      value: `${stats.revisionCompletionPercentage}%`,
      subtext: `${stats.strongPatterns} strong patterns`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      action: () => setActiveTab('roadmap'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.action}
            className={`cursor-pointer p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg ${card.bgColor} ${
              card.highlight ? 'ring-2 ring-rose-500/50 shadow-sm' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="text-2xl lg:text-3xl font-black text-foreground mt-2 font-mono tracking-tight">
              {card.value}
            </div>

            <div className="text-[11px] text-muted-foreground mt-1 truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
