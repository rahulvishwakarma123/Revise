import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Pattern, ConfidenceLevel } from '../../types';
import { PatternCard } from './PatternCard';
import { PatternModal } from './PatternModal';
import { PatternPracticeModal } from './PatternPracticeModal';
import { isPatternDue } from '../../services/scheduler';
import {
  Compass,
  Filter,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
} from 'lucide-react';

const TOPIC_OPTIONS = [
  'All',
  'Arrays',
  'Linked List',
  'Stack',
  'Queue / Deque',
  'Trees',
  'Heap',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Bit Manipulation',
  'Trie',
];

export const RoadmapView: React.FC = () => {
  const {
    patterns,
    searchQuery,
    setSearchQuery,
    selectedTopicFilter,
    setSelectedTopicFilter,
    addPattern,
  } = useApp();

  const [confidenceFilter, setConfidenceFilter] = useState<'All' | ConfidenceLevel>('All');
  const [onlyDue, setOnlyDue] = useState(false);
  const [activePatternModal, setActivePatternModal] = useState<Pattern | null>(null);
  const [practicePatternModal, setPracticePatternModal] = useState<Pattern | null>(null);
  const [isAddPatternOpen, setIsAddPatternOpen] = useState(false);

  // New Pattern Form State
  const [newPatternName, setNewPatternName] = useState('');
  const [newPatternTopic, setNewPatternTopic] = useState('Arrays');
  const [newPatternSubtopic, setNewPatternSubtopic] = useState('');
  const [newPatternIntuition, setNewPatternIntuition] = useState('');
  const [newPatternSignal, setNewPatternSignal] = useState('');
  const [newPatternTime, setNewPatternTime] = useState('O(N)');
  const [newPatternSpace, setNewPatternSpace] = useState('O(1)');

  // Collapsed topics state
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const toggleTopicCollapse = (topic: string) => {
    setCollapsedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
  };

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    return patterns.filter((p) => {
      // Topic match
      if (selectedTopicFilter !== 'All' && p.topic !== selectedTopicFilter) return false;

      // Confidence match
      if (confidenceFilter !== 'All' && p.confidence !== confidenceFilter) return false;

      // Due match
      if (onlyDue && !isPatternDue(p.nextRevision)) return false;

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesTopic = p.topic.toLowerCase().includes(query);
        const matchesSubtopic = p.subtopic?.toLowerCase().includes(query);
        const matchesIntuition = p.intuition.toLowerCase().includes(query);
        const matchesSignals = p.recognitionSignals?.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesTopic && !matchesSubtopic && !matchesIntuition && !matchesSignals) {
          return false;
        }
      }

      return true;
    });
  }, [patterns, selectedTopicFilter, confidenceFilter, onlyDue, searchQuery]);

  // Group by topic
  const groupedPatterns = useMemo(() => {
    const groups: Record<string, Pattern[]> = {};
    for (const p of filteredPatterns) {
      if (!groups[p.topic]) groups[p.topic] = [];
      groups[p.topic].push(p);
    }
    return groups;
  }, [filteredPatterns]);

  const handleCreatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatternName.trim() || !newPatternIntuition.trim()) return;

    await addPattern({
      name: newPatternName.trim(),
      topic: newPatternTopic,
      subtopic: newPatternSubtopic.trim(),
      confidence: 'Weak',
      intuition: newPatternIntuition.trim(),
      recognitionSignals: newPatternSignal ? [newPatternSignal.trim()] : [],
      timeComplexity: newPatternTime,
      spaceComplexity: newPatternSpace,
      edgeCases: [],
      canonicalProblems: [],
    });

    setNewPatternName('');
    setNewPatternIntuition('');
    setNewPatternSignal('');
    setIsAddPatternOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Compass className="w-4 h-4" />
            <span>DSA MindMap Pattern Library</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground mt-1">
            Data Structures & Algorithms Roadmap
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse 200+ core techniques mapped from dsamindmap.com. Test active recall and track spaced retention intervals.
          </p>
        </div>

        <button
          onClick={() => setIsAddPatternOpen(true)}
          className="self-start md:self-auto px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Pattern</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3.5">
        {/* Topic Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TOPIC_OPTIONS.map((topic) => {
            const isSelected = selectedTopicFilter === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopicFilter(topic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Confidence:
            </span>

            {(['All', 'Strong', 'Medium', 'Weak'] as const).map((conf) => (
              <button
                key={conf}
                onClick={() => setConfidenceFilter(conf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  confidenceFilter === conf
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
                }`}
              >
                {conf}
              </button>
            ))}

            <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-xs text-foreground">
              <input
                type="checkbox"
                checked={onlyDue}
                onChange={(e) => setOnlyDue(e.target.checked)}
                className="rounded border-border text-primary focus:ring-0 bg-background"
              />
              <span>Due Today Only</span>
            </label>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Showing <span className="text-foreground font-semibold">{filteredPatterns.length}</span> patterns
          </div>
        </div>
      </div>

      {/* Grouped Topics Display */}
      {Object.keys(groupedPatterns).length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-border text-muted-foreground shadow-sm">
          <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No patterns match your current filters.</p>
          <button
            onClick={() => {
              setSelectedTopicFilter('All');
              setConfidenceFilter('All');
              setOnlyDue(false);
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-primary hover:underline font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPatterns).map(([topic, topicPatterns]) => {
            const isCollapsed = !!collapsedTopics[topic];
            const strongCount = topicPatterns.filter((p) => p.confidence === 'Strong').length;
            const dueCount = topicPatterns.filter((p) => isPatternDue(p.nextRevision)).length;

            return (
              <div
                key={topic}
                className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4"
              >
                {/* Topic Header Accordion */}
                <div
                  onClick={() => toggleTopicCollapse(topic)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-foreground tracking-tight">
                      {topic}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {topicPatterns.length} patterns
                    </span>
                    {dueCount > 0 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        {dueCount} due
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="hidden sm:inline-block font-mono">
                      {strongCount}/{topicPatterns.length} Strong
                    </span>
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>

                {/* Pattern Cards Grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 animate-fade-in">
                    {topicPatterns.map((pattern) => (
                      <PatternCard
                        key={pattern._id || pattern.id}
                        pattern={pattern}
                        onOpenDetails={(p) => setActivePatternModal(p)}
                        onOpenPractice={(p) => setPracticePatternModal(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pattern Detail Modal */}
      <PatternModal
        pattern={activePatternModal}
        onClose={() => setActivePatternModal(null)}
      />

      {/* Pattern Practice & Confidence Modal */}
      <PatternPracticeModal
        pattern={practicePatternModal}
        onClose={() => setPracticePatternModal(null)}
      />

      {/* Add Custom Pattern Modal */}
      {isAddPatternOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 text-card-foreground">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Custom DSA Pattern
            </h3>

            <form onSubmit={handleCreatePattern} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Pattern Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPatternName}
                  onChange={(e) => setNewPatternName(e.target.value)}
                  placeholder="e.g. Monotonic Stack (Subarray Minimums)"
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Topic *
                  </label>
                  <select
                    value={newPatternTopic}
                    onChange={(e) => setNewPatternTopic(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:outline-none"
                  >
                    {TOPIC_OPTIONS.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Subtopic / Technique
                  </label>
                  <input
                    type="text"
                    value={newPatternSubtopic}
                    onChange={(e) => setNewPatternSubtopic(e.target.value)}
                    placeholder="e.g. Stack"
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Core Intuition & Mental Model *
                </label>
                <textarea
                  required
                  value={newPatternIntuition}
                  onChange={(e) => setNewPatternIntuition(e.target.value)}
                  placeholder="Explain the mental model without notes..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Primary Recognition Signal / Interview Tell
                </label>
                <input
                  type="text"
                  value={newPatternSignal}
                  onChange={(e) => setNewPatternSignal(e.target.value)}
                  placeholder="e.g. Next greater element or range minimum query"
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground"
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
                    className="w-full bg-background border border-border rounded-lg p-2 text-foreground font-mono"
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
                    className="w-full bg-background border border-border rounded-lg p-2 text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddPatternOpen(false)}
                  className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-lg shadow-md transition-all"
                >
                  Save Pattern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
