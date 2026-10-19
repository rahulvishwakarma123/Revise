import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MistakeCategory } from '../../types';
import { MistakeModal } from './MistakeModal';
import { PreInterviewCheatSheetModal } from './PreInterviewCheatSheetModal';
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Filter,
} from 'lucide-react';

const CATEGORIES: ('All' | MistakeCategory)[] = [
  'All',
  'Wrong boundary',
  'Wrong pattern',
  'Implementation bug',
  'Off-by-one',
  'Missed constraint',
  'Integer overflow',
  'TLE / Suboptimal',
];

export const MistakeJournalView: React.FC = () => {
  const { mistakes, deleteMistake } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | MistakeCategory>('All');
  const [search, setSearch] = useState('');

  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = m.problemTitle.toLowerCase().includes(q);
        const matchesTopic = m.topic.toLowerCase().includes(q);
        const matchesPattern = m.patternName.toLowerCase().includes(q);
        const matchesMistake = m.mistakeDescription.toLowerCase().includes(q);
        const matchesLesson = m.lessonLearned.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesPattern && !matchesMistake && !matchesLesson) {
          return false;
        }
      }
      return true;
    });
  }, [mistakes, selectedCategory, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Bug & Edge Case Registry</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground mt-1">
            DSA Mistake Journal
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Document wrong boundary conditions, incorrect pattern choices, and implementation slips so you never repeat them in interviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCheatSheetOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pre-Interview Cheat Sheet</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Mistake</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm font-semibold'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border text-xs">
          <span className="text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredMistakes.length}</span> logged mistakes
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mistakes or lessons..."
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground w-52 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Structured Mistake Sheet Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-3">Pattern</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">The Mistake / Bug</th>
                <th className="py-3 px-4">Key Lesson / Takeaway</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredMistakes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No mistakes logged matching this category. Great job, or click "Log Mistake" to record one!
                  </td>
                </tr>
              ) : (
                filteredMistakes.map((m) => (
                  <tr
                    key={m._id || m.id}
                    className="hover:bg-muted/60 transition-colors group"
                  >
                    {/* Problem */}
                    <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                      {m.problemUrl ? (
                        <a
                          href={m.problemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{m.problemTitle}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      ) : (
                        <span>{m.problemTitle}</span>
                      )}
                    </td>

                    {/* Pattern */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-foreground font-mono text-[11px]">
                      {m.patternName}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {m.category}
                      </span>
                    </td>

                    {/* Mistake description */}
                    <td className="py-3.5 px-4 max-w-sm text-foreground text-xs">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span>{m.mistakeDescription}</span>
                      </div>
                    </td>

                    {/* Lesson learned */}
                    <td className="py-3.5 px-4 max-w-sm text-emerald-700 dark:text-emerald-300 font-medium text-xs">
                      <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{m.lessonLearned}</span>
                      </div>
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          const targetId = m._id || m.id;
                          if (targetId && window.confirm('Delete this mistake entry?')) {
                            deleteMistake(targetId);
                          }
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete mistake"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MistakeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <PreInterviewCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};
