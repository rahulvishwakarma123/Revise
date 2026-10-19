import React, { useState } from 'react';
import { Pattern, Problem } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculatePatternConfidenceFromProblems } from '../../utils/patternConfidence';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { StatusBadge } from '../common/StatusBadge';
import { ProblemModal } from '../problems/ProblemModal';
import { ProblemDetailModal } from '../problems/ProblemDetailModal';
import {
  X,
  Brain,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  Bot,
  AlertTriangle,
  Lightbulb,
  Compass,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface Props {
  pattern: Pattern | null;
  onClose: () => void;
}

export const PatternPracticeModal: React.FC<Props> = ({ pattern, onClose }) => {
  const { problems, startActiveRecall } = useApp();
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  if (!pattern) return null;

  // Calculate pattern confidence from all problems logged for this pattern
  const confidenceStats = calculatePatternConfidenceFromProblems(pattern, problems);

  // Filter logged problems for this pattern
  const loggedPatternProblems = problems.filter(
    (p) => p.patternName?.trim().toLowerCase() === pattern.name?.trim().toLowerCase()
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl p-6 lg:p-8 text-card-foreground max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-border gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold uppercase">
                  {pattern.topic}
                </span>
                {pattern.subtopic && (
                  <span className="text-xs text-muted-foreground font-medium">
                    • {pattern.subtopic}
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                  {pattern.timeComplexity} time • {pattern.spaceComplexity} space
                </span>
              </div>

              <h2 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2.5">
                <Brain className="w-6 h-6 text-primary" />
                <span>Practice: {pattern.name}</span>
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 mt-5 text-xs">
            {/* Pattern Core Intuition Quick Card */}
            <div className="p-4 rounded-2xl bg-primary/5 dark:bg-indigo-950/20 border border-primary/20 dark:border-indigo-800/30">
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Pattern Mental Model & Core Intuition</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed font-sans">
                {pattern.intuition}
              </p>
            </div>

            {/* Requirement 5: Confidence Level based on all problems for this pattern */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-foreground">
                      Pattern Confidence Level (Based on Logged Problems)
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Calculated from independence, hints required, and pattern recognition audit scores
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div className="text-base font-black font-mono text-foreground">
                      {confidenceStats.scorePercent}%
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">Confidence Score</div>
                  </div>
                  <ConfidenceBadge confidence={confidenceStats.confidence} size="md" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    confidenceStats.confidence === 'Strong'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : confidenceStats.confidence === 'Medium'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${confidenceStats.scorePercent}%` }}
                />
              </div>

              {/* Confidence Metric Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                  <div className="text-[10px] text-muted-foreground font-medium">Logged Problems</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {confidenceStats.totalProblems}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Solved Independently</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {confidenceStats.independentCount}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                  <div className="text-[10px] text-primary font-medium">Pure (No AI / Hint)</div>
                  <div className="text-base font-bold font-mono text-primary mt-0.5">
                    {confidenceStats.noAiCount}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Avg Recognition Audit</div>
                  <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                    {confidenceStats.avgRecognitionScore > 0 ? `${confidenceStats.avgRecognitionScore} / 4` : '—'}
                  </div>
                </div>
              </div>

              {!confidenceStats.hasProblems && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    No practice problems logged yet for this pattern. Practice the benchmark problems below and log your solutions to build your verified confidence level!
                  </span>
                </div>
              )}
            </div>

            {/* Canonical Benchmark Problems Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs lg:text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Canonical Benchmark Problems</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {pattern.canonicalProblems?.length || 0}
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Handpicked benchmark questions from dsamindmap.com to master this pattern
                  </p>
                </div>

                <button
                  onClick={() => setIsProblemModalOpen(true)}
                  className="px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Practice Problem</span>
                </button>
              </div>

              {(!pattern.canonicalProblems || pattern.canonicalProblems.length === 0) ? (
                <div className="p-6 text-center rounded-2xl bg-card border border-border text-muted-foreground text-xs shadow-sm">
                  No canonical problems predefined for this custom pattern. Click "Log Practice Problem" to add your first one!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pattern.canonicalProblems.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-sm transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">
                            {prob.platform || 'LeetCode'}
                          </span>
                        </div>
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 truncate text-xs"
                          title={prob.title}
                        >
                          <span className="truncate">{prob.title}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </a>
                      </div>

                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-semibold transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <span>Solve</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logged Practice Problems Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs lg:text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Your Logged Practice Problems</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {loggedPatternProblems.length}
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Problems you have practiced and tracked for this pattern (Click any row to inspect)
                  </p>
                </div>
              </div>

              {loggedPatternProblems.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-card border border-border text-muted-foreground text-xs shadow-sm">
                  No problems logged yet. Practice a canonical problem above or log a custom problem!
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3">Problem</th>
                          <th className="py-2.5 px-3">Difficulty</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">AI / Hints</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3 text-right">Audit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {loggedPatternProblems.map((prob) => {
                          const score = [
                            prob.recognitionScore?.identifiedPattern,
                            prob.recognitionScore?.derivedBruteForce,
                            prob.recognitionScore?.couldOptimize,
                            prob.recognitionScore?.implementedWithoutHelp,
                          ].filter(Boolean).length;

                          return (
                            <tr
                              key={prob._id || prob.id}
                              onClick={() => setSelectedProblem(prob)}
                              className="hover:bg-muted/60 cursor-pointer transition-colors group"
                              title="Click to view problem details"
                            >
                              <td className="py-2.5 px-3 font-medium text-foreground max-w-[200px] truncate">
                                <span className="group-hover:text-primary transition-colors">
                                  {prob.title}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <StatusBadge status={prob.status} size="sm" />
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {prob.solvedWithoutAI ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    <span>No AI</span>
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px] flex items-center gap-1">
                                    <Bot className="w-3 h-3" />
                                    <span>Used Hint</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                                {prob.timeTakenMinutes}m
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-foreground whitespace-nowrap">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    score === 4
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {score}/4
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <button
                onClick={() => {
                  onClose();
                  startActiveRecall(pattern);
                }}
                className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors flex items-center gap-1.5 font-medium"
              >
                <Brain className="w-4 h-4 text-primary" />
                <span>Test Theory / Mental Model Active Recall</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Practice Problem Modal prefilled with this pattern */}
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        defaultPatternName={pattern.name}
        defaultTopic={pattern.topic}
      />

      {/* Problem Detail Modal if user clicks on a logged problem */}
      <ProblemDetailModal
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
      />
    </>
  );
};
