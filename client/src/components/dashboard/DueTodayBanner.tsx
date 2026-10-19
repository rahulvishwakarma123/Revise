import React from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Flame, CalendarDays } from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { getDueStatusText } from '../../services/scheduler';

export const DueTodayBanner: React.FC = () => {
  const { stats, startActiveRecall, setActiveTab } = useApp();

  if (!stats || stats.patternsDueTodayList.length === 0) return null;

  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-primary/10 border border-rose-500/30 shadow-md relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs tracking-wider uppercase">
            <Flame className="w-4 h-4 animate-pulse" />
            <span>Spaced Repetition Queue</span>
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-foreground mt-0.5">
            You have {stats.patternsDueTodayList.length} pattern{stats.patternsDueTodayList.length > 1 ? 's' : ''} scheduled for revision today
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Active recall intervals prevent forgetting curve decay. Test yourself on their core idea and edge cases before coding.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scheduler')}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] flex-shrink-0"
        >
          <CalendarDays className="w-4 h-4" />
          <span>View Revision Schedule</span>
        </button>
      </div>

      {/* Due patterns horizontal chips or list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {stats.patternsDueTodayList.slice(0, 6).map((pattern) => {
          const status = getDueStatusText(pattern.nextRevision);
          return (
            <div
              key={pattern._id || pattern.id}
              className="p-3 rounded-2xl bg-card border border-border hover:border-primary/50 flex items-center justify-between gap-3 transition-colors group shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    {pattern.topic}
                  </span>
                  <ConfidenceBadge confidence={pattern.confidence} size="sm" showIcon={false} />
                </div>
                <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {pattern.name}
                </div>
                <div className="text-[10px] text-rose-500 font-mono mt-0.5 font-medium">
                  {status.text}
                </div>
              </div>

              <button
                onClick={() => startActiveRecall(pattern)}
                className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-medium transition-all flex items-center gap-1.5 flex-shrink-0 group-hover:scale-105"
                title="Test active recall from memory"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Recall</span>
              </button>
            </div>
          );
        })}
      </div>

      {stats.patternsDueTodayList.length > 6 && (
        <div className="mt-3 text-right text-xs text-muted-foreground">
          +{stats.patternsDueTodayList.length - 6} more patterns due in queue
        </div>
      )}
    </div>
  );
};
