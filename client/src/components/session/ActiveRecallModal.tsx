import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceRating } from '../../types';
import {
  X,
  Eye,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { DifficultyBadge } from '../common/DifficultyBadge';

export const ActiveRecallModal: React.FC = () => {
  const { activeRecallPattern, setActiveRecallPattern, completeActiveRecall } = useApp();
  const [isRevealed, setIsRevealed] = useState(false);
  const [userThoughts, setUserThoughts] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeRecallPattern) return null;

  const handleRate = async (rating: PerformanceRating) => {
    setIsSubmitting(true);
    try {
      await completeActiveRecall(rating, userThoughts, 15, true);
      setIsRevealed(false);
      setUserThoughts('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveRecallPattern(null);
    setIsRevealed(false);
    setUserThoughts('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 lg:p-8 text-card-foreground max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-semibold">
                {activeRecallPattern.topic}
              </span>
              {activeRecallPattern.subtopic && (
                <span className="text-xs text-muted-foreground">/ {activeRecallPattern.subtopic}</span>
              )}
              <ConfidenceBadge confidence={activeRecallPattern.confidence} size="sm" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              {activeRecallPattern.name}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1: Test Memory (Active Recall Prompt) */}
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs lg:text-sm text-foreground">
            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              Active Recall Challenge
            </div>
            <p className="text-foreground/90 leading-relaxed">
              Without looking at the answer or your notes, explain from memory:
              <span className="block mt-1 font-mono text-xs text-primary dark:text-indigo-400">
                1. What is the core intuition & mental model?
                <br />
                2. What problem signals trigger this pattern?
                <br />
                3. What are the time and space complexities?
                <br />
                4. What edge cases must you guard against?
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Draft your mental model or notes here (optional):
            </label>
            <textarea
              value={userThoughts}
              onChange={(e) => setUserThoughts(e.target.value)}
              placeholder="e.g. In Sliding Window, expand right while sum <= k, then shrink left when violated..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
            />
          </div>

          {!isRevealed ? (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setIsRevealed(true)}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs lg:text-sm font-semibold transition-all shadow-lg shadow-primary/25 flex items-center gap-2 hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4" />
                Reveal Model Solution & Compare
              </button>
            </div>
          ) : (
            /* Phase 2: Revealed Model Pattern Details */
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3">
                <div className="border-b border-border pb-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Core Intuition
                  </div>
                  <p className="text-xs lg:text-sm text-foreground mt-1 leading-relaxed">
                    {activeRecallPattern.intuition}
                  </p>
                </div>

                <div className="border-b border-border pb-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Recognition Signals ("The Tells")
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {activeRecallPattern.recognitionSignals?.map((sig: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 border-b border-border pb-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Time Complexity
                    </div>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeRecallPattern.timeComplexity}
                    </p>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Space Complexity
                    </div>
                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {activeRecallPattern.spaceComplexity}
                    </p>
                  </div>
                </div>

                {activeRecallPattern.edgeCases?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Critical Edge Cases
                    </div>
                    <ul className="mt-1 space-y-1">
                      {activeRecallPattern.edgeCases.map((edge: string, idx: number) => (
                        <li key={idx} className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{edge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Canonical Representative Problems */}
              {activeRecallPattern.canonicalProblems?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Canonical Benchmark Problems
                  </div>
                  <div className="space-y-1.5">
                    {activeRecallPattern.canonicalProblems.map((prob: any, idx: number) => (
                      <a
                        key={idx}
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-card hover:bg-secondary/80 border border-border text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground group-hover:text-primary">
                            {prob.title}
                          </span>
                          <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 3: Self-Evaluation & Spaced Repetition Scheduling */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs lg:text-sm font-bold text-foreground">
                      Rate Your Performance & Schedule Next Revision
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Calculates the next spaced repetition interval based on active recall clarity
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Option 1: Could not solve */}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRate('Could not solve independently')}
                    className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-left transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Could not solve</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                        Tomorrow (1d)
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Could not recognize pattern or derive solution independently.
                    </p>
                  </button>

                  {/* Option 2: Solved with hint */}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRate('Solved with a hint')}
                    className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-left transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Solved with a hint</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        In 2–3 days
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Understood pattern with hints or struggled with implementation.
                    </p>
                  </button>

                  {/* Option 3: Solved independently */}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRate('Solved independently')}
                    className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-left transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Solved independently</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        In 7 days
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Explained approach and formulated solution without help.
                    </p>
                  </button>

                  {/* Option 4: Consistently strong */}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRate('Consistently strong')}
                    className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/15 text-left transition-all hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Consistently strong</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        In 14–30+ days
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Interview-ready mastery; exponentially lengthen interval.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
