import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Problem, ProblemDifficulty, SolutionStatus } from '../../types';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { StatusBadge } from '../common/StatusBadge';
import { ProblemModal } from './ProblemModal';
import { ProblemDetailModal } from './ProblemDetailModal';
import {
  CheckSquare,
  Plus,
  ExternalLink,
  Trash2,
  Clock,
  Zap,
  Bot,
  UserCheck,
  Filter,
} from 'lucide-react';

export const ProblemTrackerView: React.FC = () => {
  const { problems, deleteProblem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | ProblemDifficulty>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | SolutionStatus>('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [onlyNoAI, setOnlyNoAI] = useState(false);
  const [search, setSearch] = useState('');

  const topicsList = useMemo(() => {
    return ['All', ...Array.from(new Set(problems.map((p) => p.topic)))];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (topicFilter !== 'All' && p.topic !== topicFilter) return false;
      if (onlyNoAI && !p.solvedWithoutAI) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTopic = p.topic.toLowerCase().includes(q);
        const matchesPattern = p.patternName.toLowerCase().includes(q);
        const matchesNotes = p.keyNotes?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesPattern && !matchesNotes) return false;
      }
      return true;
    });
  }, [problems, difficultyFilter, statusFilter, topicFilter, onlyNoAI, search]);

  const total = problems.length;
  const independentCount = problems.filter((p) => p.status === 'Solved Independently').length;
  const noAiCount = problems.filter((p) => p.solvedWithoutAI).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <CheckSquare className="w-4 h-4" />
            <span>Problem Log & Recognition Audit</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground mt-1">
            DSA Practice Problem Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track solved problems, time taken, hints required, and whether you derived the pattern independently without AI assistance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start md:self-auto px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Log Practice Problem</span>
        </button>
      </div>

      {/* Mini Stat Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-[11px] text-muted-foreground font-medium">Total Solved</div>
          <div className="text-2xl font-black font-mono text-foreground mt-1">{total}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Independent</div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {independentCount}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20">
          <div className="text-[11px] text-primary font-medium">Without AI/Hints</div>
          <div className="text-2xl font-black font-mono text-primary mt-1">
            {noAiCount}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Independence Rate</div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {total > 0 ? Math.round((independentCount / total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Topic */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary"
          >
            {topicsList.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Topics' : t}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Solved Independently">Solved Independently</option>
            <option value="Solved with Hints">Solved with Hints</option>
            <option value="Unsolved">Unsolved</option>
          </select>

          {/* No AI checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-foreground hover:opacity-80">
            <input
              type="checkbox"
              checked={onlyNoAI}
              onChange={(e) => setOnlyNoAI(e.target.checked)}
              className="rounded border-border text-primary focus:ring-0 bg-background"
            />
            <span>No AI / Pure Independent</span>
          </label>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter problems..."
          className="bg-background border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground w-44 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Interactive Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-4">Topic & Pattern</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">AI / Hints</th>
                <th className="py-3 px-3">Time & Attempts</th>
                <th className="py-3 px-3">Recognition Score</th>
                <th className="py-3 px-4">Key Lesson / Notes</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    No problems logged matching these filters. Click "Log Practice Problem" to add one!
                  </td>
                </tr>
              ) : (
                filteredProblems.map((prob) => {
                  const scoreCount = [
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
                      title="Click row to view full problem information and audit"
                    >
                      {/* Title & Link */}
                      <td className="py-3 px-4 font-medium text-foreground max-w-[200px]">
                        <a
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                          title={prob.title}
                        >
                          <span className="truncate">{prob.title}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </a>
                      </td>

                      {/* Topic & Pattern */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="text-foreground font-medium truncate">
                          {prob.patternName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {prob.topic}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={prob.status} size="sm" />
                      </td>

                      {/* AI flag */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {prob.solvedWithoutAI ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>No AI</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Used AI/Hint</span>
                          </span>
                        )}
                      </td>

                      {/* Time & attempts */}
                      <td className="py-3 px-3 font-mono text-foreground whitespace-nowrap">
                        <div>{prob.timeTakenMinutes} mins</div>
                        <div className="text-[10px] text-muted-foreground">
                          {prob.attempts} {prob.attempts === 1 ? 'attempt' : 'attempts'}
                        </div>
                      </td>

                      {/* Recognition score */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {scoreCount}/4
                          </span>
                          <div className="w-12 h-1.5 bg-secondary border border-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                scoreCount === 4
                                  ? 'bg-emerald-500'
                                  : scoreCount >= 2
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${(scoreCount / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 max-w-xs text-[11px] text-muted-foreground line-clamp-2">
                        {prob.keyNotes || '—'}
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetId = prob._id || prob.id;
                            if (targetId && window.confirm(`Delete log for "${prob.title}"?`)) {
                              deleteProblem(targetId);
                            }
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Modal */}
      <ProblemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Problem Detail Modal */}
      <ProblemDetailModal
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
      />
    </div>
  );
};
