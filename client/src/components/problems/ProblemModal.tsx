import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProblemDifficulty, SolutionStatus, MistakeCategory } from '../../types';
import {
  X,
  CheckSquare,
  Plus,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Compass,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultPatternName?: string;
  defaultTopic?: string;
}

const MISTAKE_CATEGORIES: MistakeCategory[] = [
  'Wrong boundary',
  'Wrong pattern',
  'Implementation bug',
  'Off-by-one',
  'Missed constraint',
  'Integer overflow',
  'TLE / Suboptimal',
  'Other',
];

export const ProblemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultPatternName = '',
  defaultTopic = 'Arrays',
}) => {
  const { patterns, addProblem, addPattern, addMistake } = useApp();

  // Problem Fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<'LeetCode' | 'Codeforces' | 'GeeksforGeeks' | 'Other'>('LeetCode');
  const [topic, setTopic] = useState(defaultTopic);
  const [patternName, setPatternName] = useState(defaultPatternName || patterns[0]?.name || 'Fixed Size Sliding Window');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('Medium');
  const [status, setStatus] = useState<SolutionStatus>('Solved Independently');
  const [solvedWithoutAI, setSolvedWithoutAI] = useState(true);
  const [timeTakenMinutes, setTimeTakenMinutes] = useState(25);
  const [attempts, setAttempts] = useState(1);
  const [keyNotes, setKeyNotes] = useState('');

  // 4-Question Recognition Checklist
  const [identifiedPattern, setIdentifiedPattern] = useState(true);
  const [derivedBruteForce, setDerivedBruteForce] = useState(true);
  const [couldOptimize, setCouldOptimize] = useState(true);
  const [implementedWithoutHelp, setImplementedWithoutHelp] = useState(true);

  // Toggle 1: Add New Pattern
  const [isAddingNewPattern, setIsAddingNewPattern] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [newPatternIntuition, setNewPatternIntuition] = useState('');
  const [newPatternSignal, setNewPatternSignal] = useState('');
  const [newPatternSubtopic, setNewPatternSubtopic] = useState('');
  const [newPatternTime, setNewPatternTime] = useState('O(N)');
  const [newPatternSpace, setNewPatternSpace] = useState('O(1)');

  // Toggle 2: Add Mistake Entry
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [mistakeCategory, setMistakeCategory] = useState<MistakeCategory>('Wrong boundary');
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync defaults when modal opens or defaults change
  useEffect(() => {
    if (isOpen) {
      if (defaultTopic) setTopic(defaultTopic);
      if (defaultPatternName) {
        setPatternName(defaultPatternName);
      } else {
        const firstMatching = patterns.find((p) => !defaultTopic || p.topic === defaultTopic);
        if (firstMatching) setPatternName(firstMatching.name);
      }
    }
  }, [isOpen, defaultTopic, defaultPatternName, patterns]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      let finalPatternName = patternName;

      // 1. If adding new pattern is toggled on, create pattern first
      if (isAddingNewPattern) {
        if (!newPatternName.trim()) {
          alert('Please enter a name for the new pattern.');
          setIsSubmitting(false);
          return;
        }

        const createdPattern = await addPattern({
          name: newPatternName.trim(),
          topic,
          subtopic: newPatternSubtopic.trim(),
          confidence: 'Weak',
          intuition: newPatternIntuition.trim() || `Pattern intuition for ${newPatternName.trim()}`,
          recognitionSignals: newPatternSignal.trim() ? [newPatternSignal.trim()] : [],
          timeComplexity: newPatternTime || 'O(N)',
          spaceComplexity: newPatternSpace || 'O(1)',
          edgeCases: [],
          canonicalProblems: [],
        });

        finalPatternName = createdPattern.name;
      }

      // 2. Add practice problem
      await addProblem({
        title: title.trim(),
        url: url.trim() || 'https://leetcode.com',
        platform,
        topic,
        patternName: finalPatternName,
        difficulty,
        status,
        solvedWithoutAI,
        timeTakenMinutes: Number(timeTakenMinutes) || 20,
        attempts: Number(attempts) || 1,
        recognitionScore: {
          identifiedPattern,
          derivedBruteForce,
          couldOptimize,
          implementedWithoutHelp,
        },
        keyNotes: keyNotes.trim(),
        solvedAt: new Date().toISOString(),
      });

      // 3. If mistake toggle is active, save mistake in mistakes schema
      if (isAddingMistake && mistakeDescription.trim() && lessonLearned.trim()) {
        await addMistake({
          problemTitle: title.trim(),
          problemUrl: url.trim(),
          topic,
          patternName: finalPatternName,
          category: mistakeCategory,
          mistakeDescription: mistakeDescription.trim(),
          lessonLearned: lessonLearned.trim(),
        });
      }

      // Reset states
      setTitle('');
      setUrl('');
      setKeyNotes('');
      setIsAddingNewPattern(false);
      setNewPatternName('');
      setNewPatternIntuition('');
      setNewPatternSignal('');
      setIsAddingMistake(false);
      setMistakeDescription('');
      setLessonLearned('');

      onClose();
    } catch (err) {
      console.error('Failed to log problem and details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const topicsList = Array.from(new Set(patterns.map((p) => p.topic)));
  if (!topicsList.includes(topic) && topic) {
    topicsList.push(topic);
  }

  const topicPatterns = patterns.filter((p) => !topic || p.topic === topic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 lg:p-7 text-card-foreground max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-foreground">
                Log Practice Problem
              </h3>
              <p className="text-xs text-muted-foreground">
                Track problem metrics, patterns, and mistakes in one place
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Title & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Subarray Sum Equals K"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Problem URL (LeetCode / CF)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Platform, Difficulty, Status, Without AI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Solution Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SolutionStatus)}
                className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Solved Independently">Solved Independently</option>
                <option value="Solved with Hints">Solved with Hints</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Solved w/o AI?
              </label>
              <select
                value={solvedWithoutAI ? 'yes' : 'no'}
                onChange={(e) => setSolvedWithoutAI(e.target.value === 'yes')}
                className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="yes">Yes (No AI)</option>
                <option value="no">No (Used AI/Hint)</option>
              </select>
            </div>
          </div>

          {/* Topic & Pattern Selection with Toggle for New Pattern */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">DSA Topic & Pattern</span>
              </div>

              {/* Requirement 3: Toggle button for adding a new pattern directly */}
              <button
                type="button"
                onClick={() => setIsAddingNewPattern(!isAddingNewPattern)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isAddingNewPattern
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-primary hover:bg-secondary/80 border border-border'
                }`}
              >
                <Plus className={`w-3.5 h-3.5 transition-transform ${isAddingNewPattern ? 'rotate-45' : ''}`} />
                <span>{isAddingNewPattern ? 'Select Existing Pattern' : '+ Add New Pattern'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Topic *
                </label>
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    const matching = patterns.filter((p) => p.topic === e.target.value);
                    if (matching.length > 0) setPatternName(matching[0].name);
                  }}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:border-primary focus:outline-none"
                >
                  {topicsList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {!isAddingNewPattern ? (
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Existing DSA Pattern *
                  </label>
                  <select
                    value={patternName}
                    onChange={(e) => setPatternName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:border-primary focus:outline-none"
                  >
                    {topicPatterns.length === 0 ? (
                      <option value="">No patterns found in {topic} (Click 'Add New Pattern')</option>
                    ) : (
                      topicPatterns.map((p) => (
                        <option key={p._id || p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-medium text-primary mb-1">
                    New Pattern Name *
                  </label>
                  <input
                    type="text"
                    required={isAddingNewPattern}
                    value={newPatternName}
                    onChange={(e) => setNewPatternName(e.target.value)}
                    placeholder="e.g. Monotonic Deque (Sliding Window Maximum)"
                    className="w-full bg-background border border-primary rounded-xl p-2.5 text-foreground focus:border-primary focus:outline-none ring-1 ring-primary/30"
                  />
                </div>
              )}
            </div>

            {/* Extended fields when Add New Pattern is active */}
            {isAddingNewPattern && (
              <div className="pt-2 border-t border-border space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Subtopic / Technique (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPatternSubtopic}
                      onChange={(e) => setNewPatternSubtopic(e.target.value)}
                      placeholder="e.g. Sliding Window / Deque"
                      className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Recognition Tell / Signal
                    </label>
                    <input
                      type="text"
                      value={newPatternSignal}
                      onChange={(e) => setNewPatternSignal(e.target.value)}
                      placeholder="e.g. Max/min element in moving contiguous window"
                      className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Core Intuition & Mental Model *
                  </label>
                  <textarea
                    required={isAddingNewPattern}
                    value={newPatternIntuition}
                    onChange={(e) => setNewPatternIntuition(e.target.value)}
                    placeholder="Explain the mental model (e.g. Maintain decreasing deque of indices so front is always maximum)..."
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl p-2 text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Time Complexity
                    </label>
                    <input
                      type="text"
                      value={newPatternTime}
                      onChange={(e) => setNewPatternTime(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-2 text-foreground font-mono text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Space Complexity
                    </label>
                    <input
                      type="text"
                      value={newPatternSpace}
                      onChange={(e) => setNewPatternSpace(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-2 text-foreground font-mono text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time & Attempts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Time Taken (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={timeTakenMinutes}
                onChange={(e) => setTimeTakenMinutes(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl p-2 text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Attempts
              </label>
              <input
                type="number"
                min="1"
                value={attempts}
                onChange={(e) => setAttempts(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl p-2 text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* The 4-Question Pattern Recognition Checklist */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm space-y-2">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Pattern Recognition Self-Evaluation Checklist
            </div>
            <p className="text-[11px] text-muted-foreground">
              Check all steps you completed independently before seeing editorials:
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-foreground hover:opacity-80">
                <input
                  type="checkbox"
                  checked={identifiedPattern}
                  onChange={(e) => setIdentifiedPattern(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0 bg-background"
                />
                <span>1. Did I identify the pattern correctly?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-foreground hover:opacity-80">
                <input
                  type="checkbox"
                  checked={derivedBruteForce}
                  onChange={(e) => setDerivedBruteForce(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0 bg-background"
                />
                <span>2. Could I derive the brute-force approach?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-foreground hover:opacity-80">
                <input
                  type="checkbox"
                  checked={couldOptimize}
                  onChange={(e) => setCouldOptimize(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0 bg-background"
                />
                <span>3. Could I optimize it to target Big-O?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-foreground hover:opacity-80">
                <input
                  type="checkbox"
                  checked={implementedWithoutHelp}
                  onChange={(e) => setImplementedWithoutHelp(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-0 bg-background"
                />
                <span>4. Could I implement and dry-run without help?</span>
              </label>
            </div>
          </div>

          {/* Key Notes */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Key Notes & Insights
            </label>
            <textarea
              value={keyNotes}
              onChange={(e) => setKeyNotes(e.target.value)}
              placeholder="e.g. Remember to handle negative numbers with prefix map..."
              rows={2}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Requirement 2: Combined Mistake Form with Toggle */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isAddingMistake
                ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20 shadow-sm'
                : 'bg-card border-border shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isAddingMistake
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                      : 'bg-secondary text-muted-foreground border-border'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Log Mistake & Concrete Lesson for this Problem?
                    {isAddingMistake && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Saves to Mistake Journal
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Directly saves bugs, off-by-one errors, and interview rules on the go
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isAddingMistake}
                onClick={() => setIsAddingMistake(!isAddingMistake)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isAddingMistake ? 'bg-amber-500' : 'bg-secondary border border-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isAddingMistake ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Expanded Mistake Fields */}
            {isAddingMistake && (
              <div className="mt-3.5 pt-3 border-t border-amber-500/20 space-y-3 animate-fade-in">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Mistake Category *
                  </label>
                  <select
                    value={mistakeCategory}
                    onChange={(e) => setMistakeCategory(e.target.value as MistakeCategory)}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-amber-600 dark:text-amber-400 font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    {MISTAKE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>What was the exact mistake / bug? *</span>
                  </label>
                  <textarea
                    required={isAddingMistake}
                    value={mistakeDescription}
                    onChange={(e) => setMistakeDescription(e.target.value)}
                    placeholder="e.g. Checked nums[left] < target < nums[mid] without inclusive bounds, prematurely discarding matches..."
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground focus:border-rose-500 focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Lesson Learned (The rule to remember before your next interview) *</span>
                  </label>
                  <textarea
                    required={isAddingMistake}
                    value={lessonLearned}
                    onChange={(e) => setLessonLearned(e.target.value)}
                    placeholder="e.g. Recheck inclusive endpoints: Always check inclusive <= and >= at the outer boundaries..."
                    rows={2}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium focus:border-emerald-500 focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-xl shadow-md transition-all font-semibold flex items-center gap-2"
            >
              {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
              <span>
                {isAddingMistake ? 'Save Problem & Mistake Log' : 'Save Problem Log'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
