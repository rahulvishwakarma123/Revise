import React, { useState } from 'react';
import { Problem, Mistake } from '../../types';
import { useApp } from '../../context/AppContext';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { StatusBadge } from '../common/StatusBadge';
import { MistakeModal } from '../mistakes/MistakeModal';
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  RotateCcw,
  Bot,
  UserCheck,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

interface Props {
  problem: Problem | null;
  onClose: () => void;
}

export const ProblemDetailModal: React.FC<Props> = ({ problem, onClose }) => {
  const { deleteProblem, mistakes } = useApp();
  const [isAddMistakeOpen, setIsAddMistakeOpen] = useState(false);

  if (!problem) return null;

  // Find associated mistakes for this problem
  const problemMistakes = mistakes.filter(
    (m) =>
      m.problemTitle.trim().toLowerCase() === problem.title.trim().toLowerCase() ||
      (m.problemUrl && problem.url && m.problemUrl.trim().toLowerCase() === problem.url.trim().toLowerCase())
  );

  const scoreCount = [
    problem.recognitionScore?.identifiedPattern,
    problem.recognitionScore?.derivedBruteForce,
    problem.recognitionScore?.couldOptimize,
    problem.recognitionScore?.implementedWithoutHelp,
  ].filter(Boolean).length;

  const handleDelete = async () => {
    const targetId = problem._id || problem.id;
    if (targetId && window.confirm(`Are you sure you want to delete the log for "${problem.title}"?`)) {
      await deleteProblem(targetId);
      onClose();
    }
  };

  const checklistItems = [
    {
      label: '1. Did I identify the pattern correctly?',
      passed: !!problem.recognitionScore?.identifiedPattern,
    },
    {
      label: '2. Could I derive the brute-force approach?',
      passed: !!problem.recognitionScore?.derivedBruteForce,
    },
    {
      label: '3. Could I optimize it to target Big-O?',
      passed: !!problem.recognitionScore?.couldOptimize,
    },
    {
      label: '4. Could I implement and dry-run without help?',
      passed: !!problem.recognitionScore?.implementedWithoutHelp,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 lg:p-7 text-card-foreground max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-border gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold uppercase">
                  {problem.topic}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  • {problem.patternName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                  {problem.platform || 'LeetCode'}
                </span>
              </div>

              <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2 mt-1">
                <span>{problem.title}</span>
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5 mt-4 text-xs">
            {/* Quick Metrics & Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-secondary/40 border border-border flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Difficulty</span>
                <div className="mt-1">
                  <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-border flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Solution Status</span>
                <div className="mt-1">
                  <StatusBadge status={problem.status} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-border flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">Time & Attempts</span>
                <div className="mt-1 font-mono text-foreground font-medium">
                  {problem.timeTakenMinutes} mins • {problem.attempts} {problem.attempts === 1 ? 'attempt' : 'attempts'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/40 border border-border flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground">AI Assistance</span>
                <div className="mt-1">
                  {problem.solvedWithoutAI ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Pure Independent</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Used AI / Hints</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pattern Recognition Self-Evaluation Checklist Card */}
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-bold text-foreground text-xs lg:text-sm">
                    Pattern Recognition Audit Score
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {scoreCount} / 4
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      scoreCount === 4
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : scoreCount >= 2
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {scoreCount === 4 ? 'Mastery' : scoreCount >= 2 ? 'Developing' : 'Needs Practice'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-xl border ${
                      item.passed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Notes & Insights */}
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Key Notes & Insights
              </div>
              <p className="text-xs text-foreground leading-relaxed font-sans whitespace-pre-wrap">
                {problem.keyNotes ? problem.keyNotes : 'No key notes recorded for this practice problem.'}
              </p>
            </div>

            {/* Associated Mistakes & Concrete Lessons */}
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="font-bold text-foreground text-xs">
                    Associated Mistakes ({problemMistakes.length})
                  </span>
                </div>

                <button
                  onClick={() => setIsAddMistakeOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>+ Add Mistake</span>
                </button>
              </div>

              {problemMistakes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  No mistakes recorded for this problem. Clean solve!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {problemMistakes.map((m) => (
                    <div
                      key={m._id || m.id}
                      className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold">
                          {m.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-foreground">
                        <span className="font-medium text-rose-600 dark:text-rose-400">Bug: </span>
                        {m.mistakeDescription}
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 font-medium">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Lesson: </span>
                          {m.lessonLearned}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solved timestamp */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Solved: {new Date(problem.solvedAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <button
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-500/10 transition-colors font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Problem Log</span>
              </button>

              <div className="flex items-center gap-2">
                {problem.url && (
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-all font-semibold flex items-center gap-1.5"
                  >
                    <span>Open in {problem.platform || 'LeetCode'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Mistake Modal */}
      <MistakeModal
        isOpen={isAddMistakeOpen}
        onClose={() => setIsAddMistakeOpen(false)}
        defaultPatternName={problem.patternName}
        defaultTopic={problem.topic}
      />
    </>
  );
};
