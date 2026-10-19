import React from 'react';
import type { Pattern } from '../../types';
import { useApp } from '../../context/AppContext';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { getDueStatusText } from '../../services/scheduler';
import { calculatePatternConfidenceFromProblems } from '../../utils/patternConfidence';
import { Brain, Calendar, ChevronRight } from 'lucide-react';

interface Props {
  pattern: Pattern;
  onOpenDetails: (pattern: Pattern) => void;
  onOpenPractice: (pattern: Pattern) => void;
}

export const PatternCard: React.FC<Props> = ({ pattern, onOpenDetails, onOpenPractice }) => {
  const { problems } = useApp();
  const status = getDueStatusText(pattern.nextRevision);
  const confidenceStats = calculatePatternConfidenceFromProblems(pattern, problems);

  return (
    <div className="p-4 rounded-2xl bg-card text-card-foreground border border-border hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between group">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-semibold uppercase">
              {pattern.topic}
            </span>
            {pattern.subtopic && (
              <span className="text-[10px] text-muted-foreground">
                • {pattern.subtopic}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {confidenceStats.hasProblems && (
              <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                {confidenceStats.scorePercent}%
              </span>
            )}
            <ConfidenceBadge confidence={confidenceStats.confidence} size="sm" />
          </div>
        </div>

        {/* Pattern Name */}
        <h4
          onClick={() => onOpenDetails(pattern)}
          className="text-sm font-bold text-foreground group-hover:text-primary cursor-pointer transition-colors leading-snug line-clamp-1"
        >
          {pattern.name}
        </h4>

        {/* Intuition snippet */}
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {pattern.intuition}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border space-y-2.5">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className={status.isDueToday ? 'text-rose-500 font-medium' : 'text-muted-foreground'}>
              {status.text}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-muted-foreground">
            <span>Interval:</span>
            <span className="text-primary font-semibold">{pattern.revisionIntervalDays}d</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={() => onOpenPractice(pattern)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            title="Open practice problem list and inspect pattern confidence"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Active Recall</span>
          </button>

          <button
            onClick={() => onOpenDetails(pattern)}
            className="py-1.5 px-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border text-xs font-medium transition-colors flex items-center justify-center"
            title="View pattern mindmap details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
