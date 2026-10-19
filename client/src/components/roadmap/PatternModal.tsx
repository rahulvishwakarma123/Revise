import React from 'react';
import type { Pattern, ConfidenceLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Brain,
  ExternalLink,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { getDueStatusText } from '../../services/scheduler';

interface Props {
  pattern: Pattern | null;
  onClose: () => void;
  onOpenAddProblem?: (patternName: string, topic: string) => void;
  onOpenAddMistake?: (patternName: string, topic: string) => void;
}

export const PatternModal: React.FC<Props> = ({
  pattern,
  onClose,
  onOpenAddProblem,
}) => {
  const { startActiveRecall, updatePattern, problems, mistakes } = useApp();

  if (!pattern) return null;

  const patternProblems = problems.filter((p) => p.patternName === pattern.name);
  const patternMistakes = mistakes.filter((m) => m.patternName === pattern.name);
  const status = getDueStatusText(pattern.nextRevision);

  const handleUpdateConfidence = async (newConf: ConfidenceLevel) => {
    const id = pattern._id || pattern.id;
    if (id) {
      await updatePattern(id, { confidence: newConf });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-card border border-border text-card-foreground rounded-3xl shadow-2xl p-6 lg:p-8 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20 font-semibold">
                {pattern.topic}
              </span>
              {pattern.subtopic && (
                <span className="text-xs text-muted-foreground">/ {pattern.subtopic}</span>
              )}
              <ConfidenceBadge confidence={pattern.confidence} size="sm" />
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                status.isDueToday ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-secondary text-secondary-foreground'
              }`}>
                {status.text}
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              {pattern.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout Bar */}
        <div className="my-4 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-foreground">
            Current Spaced Interval: <span className="font-mono font-bold text-primary">{pattern.revisionIntervalDays} days</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                startActiveRecall(pattern);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Active Recall Session</span>
            </button>

            {/* Quick Confidence Switcher */}
            <select
              value={pattern.confidence}
              onChange={(e) => handleUpdateConfidence(e.target.value as ConfidenceLevel)}
              className="bg-background border border-border text-xs text-foreground rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="Strong">Confidence: Strong</option>
              <option value="Medium">Confidence: Medium</option>
              <option value="Weak">Confidence: Weak</option>
            </select>
          </div>
        </div>

        {/* Core Content Grid */}
        <div className="space-y-5">
          {/* 1. Core Intuition */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Core Intuition & Mental Model
            </div>
            <p className="text-xs lg:text-sm text-foreground leading-relaxed font-sans">
              {pattern.intuition}
            </p>
          </div>

          {/* 2. Recognition Signals */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Recognition Signals ("The Tells in an Interview")
            </div>
            <ul className="space-y-1.5">
              {pattern.recognitionSignals?.map((sig, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground">
                  <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Complexities & Edge cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Complexity Targets
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">Time Complexity:</span>
                  <span className="font-mono text-emerald-500 font-semibold">{pattern.timeComplexity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Space Complexity:</span>
                  <span className="font-mono text-primary font-semibold">{pattern.spaceComplexity}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Critical Edge Cases
              </div>
              <ul className="space-y-1">
                {pattern.edgeCases?.map((edge, idx) => (
                  <li key={idx} className="text-xs text-amber-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span>{edge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Canonical Problems */}
          {pattern.canonicalProblems?.length > 0 && (
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Canonical LeetCode Problems
              </div>
              <div className="space-y-2">
                {pattern.canonicalProblems.map((p, idx) => (
                  <a
                    key={idx}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-card hover:bg-secondary border border-border text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-foreground group-hover:text-primary">
                        {p.title}
                      </span>
                      <DifficultyBadge difficulty={p.difficulty} size="sm" />
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 5. User Problem Log for this Pattern */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Problems Solved for this Pattern ({patternProblems.length})
              </div>
              {onOpenAddProblem && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddProblem(pattern.name, pattern.topic);
                  }}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Problem</span>
                </button>
              )}
            </div>

            {patternProblems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No problems logged yet. Practice a problem and track your pattern recognition score!
              </p>
            ) : (
              <div className="space-y-1.5">
                {patternProblems.map((prob) => (
                  <div
                    key={prob._id || prob.id}
                    className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-foreground font-medium">{prob.title}</span>
                      <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {prob.timeTakenMinutes}m • {prob.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Mistakes Logged for this Pattern */}
          {patternMistakes.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-2">
                Mistakes Logged for this Pattern ({patternMistakes.length})
              </div>
              <div className="space-y-2">
                {patternMistakes.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="p-2.5 rounded-xl bg-card border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{m.problemTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-mono">
                        {m.category}
                      </span>
                    </div>
                    <p className="text-foreground text-[11px]">{m.mistakeDescription}</p>
                    <p className="text-emerald-500 text-[11px] font-medium">
                      Rule: {m.lessonLearned}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
