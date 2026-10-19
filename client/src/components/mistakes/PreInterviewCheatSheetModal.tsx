import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PreInterviewCheatSheetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { mistakes } = useApp();
  const [selectedTopic, setSelectedTopic] = useState('All');

  if (!isOpen) return null;

  const topics = ['All', ...Array.from(new Set(mistakes.map((m) => m.topic)))];

  const filteredMistakes = selectedTopic === 'All'
    ? mistakes
    : mistakes.filter((m) => m.topic === selectedTopic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl p-6 lg:p-8 text-card-foreground max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold">
                High-Yield Review
              </span>
              <span className="text-xs text-muted-foreground">10-Minute Pre-Interview Routine</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Pre-Interview & Contest Mistake Cheat Sheet
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Reviewing your past bugs, edge-case traps, and missed constraints before an interview prevents recurring slips.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter by Topic */}
        <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Topic:
          </span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1 rounded-xl font-medium transition-colors whitespace-nowrap ${
                selectedTopic === t
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* High yield lessons list */}
        <div className="space-y-3.5 mt-2">
          {filteredMistakes.length === 0 ? (
            <p className="py-12 text-center text-xs text-muted-foreground italic">
              No mistake entries logged yet for this category.
            </p>
          ) : (
            filteredMistakes.map((m, idx) => (
              <div
                key={m._id || m.id || idx}
                className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {m.problemTitle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                      {m.patternName}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    {m.category}
                  </span>
                </div>

                {/* The Trap */}
                <div className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-rose-700 dark:text-rose-300">The Slip: </span>
                    <span>{m.mistakeDescription}</span>
                  </div>
                </div>

                {/* The Actionable Rule */}
                <div className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
                  <Lightbulb className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">Key Rule to Remember: </span>
                    <span>{m.lessonLearned}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-medium text-xs rounded-xl transition-colors"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
