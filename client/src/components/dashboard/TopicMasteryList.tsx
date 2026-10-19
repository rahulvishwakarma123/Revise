import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, ChevronRight } from 'lucide-react';

export const TopicMasteryList: React.FC = () => {
  const { stats, setActiveTab, setSelectedTopicFilter } = useApp();

  if (!stats || !stats.topicBreakdown) return null;

  const topics = Object.entries(stats.topicBreakdown);

  const handleTopicClick = (topicName: string) => {
    setSelectedTopicFilter(topicName);
    setActiveTab('roadmap');
  };

  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-card border border-border shadow-sm text-card-foreground">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            DSA Roadmap Topic Progress
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click any topic to explore individual patterns and active recall triggers
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTopicFilter('All');
            setActiveTab('roadmap');
          }}
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
        >
          <span>View All MindMap</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topics.map(([topicName, data]) => {
          const strongPct = data.total > 0 ? Math.round((data.strong / data.total) * 100) : 0;
          return (
            <div
              key={topicName}
              onClick={() => handleTopicClick(topicName)}
              className="p-3.5 rounded-2xl bg-secondary/50 border border-border hover:border-primary/50 cursor-pointer transition-all hover:scale-[1.01] group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {topicName}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {data.strong}/{data.total} strong
                </span>
              </div>

              {/* Multi-segment progress bar */}
              <div className="w-full h-2 rounded-full bg-secondary flex overflow-hidden mb-2">
                <div
                  style={{ width: `${(data.strong / data.total) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`${data.strong} Strong`}
                />
                <div
                  style={{ width: `${(data.medium / data.total) * 100}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`${data.medium} Medium`}
                />
                <div
                  style={{ width: `${(data.weak / data.total) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`${data.weak} Weak`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-mono">{strongPct}% Mastery</span>
                {data.due > 0 ? (
                  <span className="text-rose-500 font-mono font-medium">
                    {data.due} due for review
                  </span>
                ) : (
                  <span className="text-emerald-500 font-mono font-medium">Up to date</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
