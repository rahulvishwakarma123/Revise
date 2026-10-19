import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MistakeCategory } from '../../types';
import { X, BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPatternName?: string;
  defaultTopic?: string;
}

const CATEGORIES: MistakeCategory[] = [
  'Wrong boundary',
  'Wrong pattern',
  'Implementation bug',
  'Off-by-one',
  'Missed constraint',
  'Integer overflow',
  'TLE / Suboptimal',
  'Other',
];

export const MistakeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultPatternName = '',
  defaultTopic = 'Arrays',
}) => {
  const { patterns, addMistake } = useApp();

  const [problemTitle, setProblemTitle] = useState('');
  const [problemUrl, setProblemUrl] = useState('');
  const [topic, setTopic] = useState(defaultTopic);
  const [patternName, setPatternName] = useState(defaultPatternName || patterns[0]?.name || 'Fixed Size Sliding Window');
  const [category, setCategory] = useState<MistakeCategory>('Wrong boundary');
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim() || !mistakeDescription.trim() || !lessonLearned.trim()) return;

    await addMistake({
      problemTitle: problemTitle.trim(),
      problemUrl: problemUrl.trim(),
      topic,
      patternName,
      category,
      mistakeDescription: mistakeDescription.trim(),
      lessonLearned: lessonLearned.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 text-card-foreground max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Log Mistake & Concrete Lesson
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">
              Problem Title *
            </label>
            <input
              type="text"
              required
              value={problemTitle}
              onChange={(e) => setProblemTitle(e.target.value)}
              placeholder="e.g. Subarray Sum Equals K"
              className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Topic *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-amber-500 focus:outline-none"
              >
                {Array.from(new Set(patterns.map((p) => p.topic))).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                DSA Pattern *
              </label>
              <select
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-amber-500 focus:outline-none"
              >
                {patterns
                  .filter((p) => !topic || p.topic === topic)
                  .map((p) => (
                    <option key={p._id || p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Mistake Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MistakeCategory)}
              className="w-full bg-background border border-border rounded-lg p-2.5 font-semibold text-amber-700 dark:text-amber-400 focus:border-amber-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              What was the exact mistake / bug? *
            </label>
            <textarea
              required
              value={mistakeDescription}
              onChange={(e) => setMistakeDescription(e.target.value)}
              placeholder="e.g. Checked nums[left] < target < nums[mid] without inclusive bounds, prematurely discarding matches..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              Lesson Learned (The rule to remember before your next interview) *
            </label>
            <textarea
              required
              value={lessonLearned}
              onChange={(e) => setLessonLearned(e.target.value)}
              placeholder="e.g. Recheck inclusive endpoints: Always check inclusive <= and >= at the outer boundaries..."
              rows={2}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-emerald-700 dark:text-emerald-300 font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Save Mistake Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
