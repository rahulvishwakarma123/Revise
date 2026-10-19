import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Problem, ProblemDifficulty, SolutionStatus, Pattern } from '../../types';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { StatusBadge } from '../common/StatusBadge';
import { ProblemModal } from '../problems/ProblemModal';
import { ProblemDetailModal } from '../problems/ProblemDetailModal';
import { getDueStatusText, isPatternDue } from '../../services/scheduler';
import {
  CalendarDays,
  ExternalLink,
  Plus,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckSquare,
  Bot,
  UserCheck,
  Brain,
  RotateCcw,
} from 'lucide-react';

interface ScheduledProblemItem {
  id: string;
  title: string;
  url: string;
  platform: 'LeetCode' | 'Codeforces' | 'GeeksforGeeks' | 'Other';
  topic: string;
  patternName: string;
  difficulty: ProblemDifficulty;
  status: SolutionStatus | 'Not Started';
  solvedWithoutAI: boolean;
  timeTakenMinutes?: number;
  attempts?: number;
  dueDate: Date;
  dueStatus: { text: string; isOverdue: boolean; isDueToday: boolean };
  priorityReason: string;
  isBenchmark?: boolean;
  rawProblem?: Problem;
}

export const SchedulerView: React.FC = () => {
  const { patterns, problems } = useApp();

  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | ProblemDifficulty>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [logModalProps, setLogModalProps] = useState<{
    isOpen: boolean;
    defaultPatternName?: string;
    defaultTopic?: string;
  }>({ isOpen: false });

  // Generate scheduled problems list from both logged problems and due pattern benchmark problems
  const scheduledProblems = useMemo(() => {
    const list: ScheduledProblemItem[] = [];
    const now = new Date();

    // 1. Process all logged problems
    for (const prob of problems) {
      const pattern = patterns.find(
        (p) => p.name?.trim().toLowerCase() === prob.patternName?.trim().toLowerCase()
      );

      let dueDate: Date;
      let priorityReason = 'Spaced Practice';

      if (prob.status === 'Unsolved') {
        dueDate = now;
        priorityReason = 'Unsolved Problem (Retry Today)';
      } else if (prob.status === 'Solved with Hints') {
        // Needs practice within 2-3 days
        if (pattern?.nextRevision && isPatternDue(pattern.nextRevision)) {
          dueDate = now;
        } else {
          const solvedTime = new Date(prob.solvedAt || now).getTime();
          const targetTime = solvedTime + 2 * 86400000;
          dueDate = targetTime <= now.getTime() ? now : new Date(targetTime);
        }
        priorityReason = 'Solved with Hints (Practice Independent)';
      } else {
        // Solved independently
        if (pattern?.nextRevision) {
          dueDate = new Date(pattern.nextRevision);
          if (isPatternDue(pattern.nextRevision)) {
            priorityReason = `Pattern Due Today (${pattern.name})`;
          } else {
            priorityReason = 'Spaced Retention';
          }
        } else {
          dueDate = new Date(now.getTime() + 7 * 86400000);
        }
      }

      list.push({
        id: prob._id || prob.id || `prob_${prob.title}`,
        title: prob.title,
        url: prob.url,
        platform: prob.platform || 'LeetCode',
        topic: prob.topic,
        patternName: prob.patternName,
        difficulty: prob.difficulty,
        status: prob.status,
        solvedWithoutAI: prob.solvedWithoutAI,
        timeTakenMinutes: prob.timeTakenMinutes,
        attempts: prob.attempts,
        dueDate,
        dueStatus: getDueStatusText(dueDate.toISOString()),
        priorityReason,
        isBenchmark: false,
        rawProblem: prob,
      });
    }

    // 2. Include canonical benchmark problems from patterns due today if not already logged
    for (const pat of patterns) {
      if (isPatternDue(pat.nextRevision) && pat.canonicalProblems?.length) {
        for (const canon of pat.canonicalProblems) {
          const alreadyLogged = problems.some(
            (p) => p.title.trim().toLowerCase() === canon.title.trim().toLowerCase()
          );

          if (!alreadyLogged) {
            list.push({
              id: `canon_${pat.name}_${canon.title}`,
              title: canon.title,
              url: canon.url,
              platform: (canon.platform as any) || 'LeetCode',
              topic: pat.topic,
              patternName: pat.name,
              difficulty: canon.difficulty,
              status: 'Not Started',
              solvedWithoutAI: false,
              dueDate: now,
              dueStatus: { text: 'Due Today', isOverdue: false, isDueToday: true },
              priorityReason: `Benchmark for Due Pattern (${pat.name})`,
              isBenchmark: true,
            });
          }
        }
      }
    }

    // Sort: Due/overdue first, then by dueDate ascending
    return list.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [patterns, problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return scheduledProblems.filter((item) => {
      if (filterTopic !== 'All' && item.topic !== filterTopic) return false;
      if (filterDifficulty !== 'All' && item.difficulty !== filterDifficulty) return false;

      if (filterStatus === 'Due Today') {
        if (!item.dueStatus.isDueToday) return false;
      } else if (filterStatus === 'Needs Review') {
        if (item.status !== 'Unsolved' && item.status !== 'Solved with Hints') return false;
      } else if (filterStatus === 'Independent') {
        if (item.status !== 'Solved Independently') return false;
      } else if (filterStatus === 'Benchmarks') {
        if (!item.isBenchmark) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTopic = item.topic.toLowerCase().includes(q);
        const matchesPattern = item.patternName.toLowerCase().includes(q);
        const matchesReason = item.priorityReason.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesPattern && !matchesReason) return false;
      }

      return true;
    });
  }, [scheduledProblems, filterTopic, filterDifficulty, filterStatus, searchQuery]);

  const dueNowProblems = useMemo(() => {
    return filteredProblems.filter((p) => p.dueStatus.isDueToday || p.dueStatus.isOverdue);
  }, [filteredProblems]);

  const upcomingProblems = useMemo(() => {
    return filteredProblems.filter((p) => !p.dueStatus.isDueToday && !p.dueStatus.isOverdue);
  }, [filteredProblems]);

  // Topics for filter
  const allTopics = useMemo(() => {
    return ['All', ...Array.from(new Set(patterns.map((p) => p.topic)))];
  }, [patterns]);

  // Overall metric counters
  const totalDueCount = scheduledProblems.filter((p) => p.dueStatus.isDueToday || p.dueStatus.isOverdue).length;
  const needsReviewCount = scheduledProblems.filter((p) => p.status === 'Unsolved' || p.status === 'Solved with Hints').length;
  const independentCount = scheduledProblems.filter((p) => p.status === 'Solved Independently').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <CalendarDays className="w-4 h-4" />
            <span>Problem-Centric Revision Engine</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground mt-1">
            What to Practice: Revision Schedule
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Targeted problem practice queue determined by your spaced repetition retention curve and problem difficulty.
          </p>
        </div>

        <button
          onClick={() => setLogModalProps({ isOpen: true })}
          className="self-start md:self-auto px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Log Practice Problem</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Problems Due Today</div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
            {totalDueCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Needs Review (Hints/Unsolved)</div>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {needsReviewCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Independent Practice</div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {independentCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-[11px] text-muted-foreground font-medium">Total Queue Problems</div>
          <div className="text-2xl font-black font-mono text-foreground mt-1">
            {scheduledProblems.length}
          </div>
        </div>
      </div>

      {/* Spaced Intervals Guide Banner */}
      <div className="p-4 rounded-2xl bg-primary/5 dark:bg-indigo-950/30 border border-primary/20 dark:border-indigo-800/40 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Spaced Problem Repetition Rules:</span>
        </div>
        <div className="flex items-center gap-4 text-foreground font-mono text-[11px] flex-wrap">
          <div>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Unsolved:</span> Today (Immediate Retry)
          </div>
          <div>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Solved w/ hint:</span> In 2–3 days
          </div>
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Independent solve:</span> In 7–14 days
          </div>
          <div>
            <span className="text-primary font-semibold">Mastered:</span> In 30+ days
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Topic */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
          >
            {allTopics.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Topics' : t}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as any)}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Priority Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
          >
            <option value="All">All Schedules</option>
            <option value="Due Today">Due for Practice Today</option>
            <option value="Needs Review">Needs Review (Hints/Unsolved)</option>
            <option value="Independent">Solved Independently</option>
            <option value="Benchmarks">Benchmark Problems</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems to practice..."
            className="bg-background border border-border rounded-xl pl-8 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground w-52 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* SECTION 1: Due for Practice Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span>Problems Due for Practice Today ({dueNowProblems.length})</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            High priority to prevent retention loss
          </span>
        </div>

        {dueNowProblems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border bg-card/60 text-center text-muted-foreground text-xs shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">All caught up for today!</p>
            <p className="mt-1 text-muted-foreground">
              No problems currently due in this filter. Check the upcoming queue below or log a new practice problem.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Problem to Practice</th>
                    <th className="py-3 px-4">Topic & Pattern</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Practice Reason</th>
                    <th className="py-3 px-3">Due Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground bg-card/60 dark:bg-transparent">
                  {dueNowProblems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (item.rawProblem) setSelectedProblem(item.rawProblem);
                      }}
                      className={`hover:bg-muted/60 transition-colors group ${
                        item.rawProblem ? 'cursor-pointer' : ''
                      }`}
                      title={item.rawProblem ? 'Click row to view full problem information and checklist' : ''}
                    >
                      {/* Title & Link */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                            title={item.title}
                          >
                            <span className="truncate">{item.title}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          </a>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {item.platform} {item.isBenchmark && '• Recommended Benchmark'}
                        </div>
                      </td>

                      {/* Topic & Pattern */}
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="text-foreground font-medium truncate">
                          {item.patternName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {item.topic}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DifficultyBadge difficulty={item.difficulty} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.status === 'Not Started' ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                            Not Started
                          </span>
                        ) : (
                          <StatusBadge status={item.status} size="sm" />
                        )}
                      </td>

                      {/* Priority Reason */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border ${
                            item.status === 'Unsolved'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : item.status === 'Solved with Hints'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {item.priorityReason}
                        </span>
                      </td>

                      {/* Due Status */}
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {item.dueStatus.text}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-sm flex items-center gap-1"
                            title="Open problem to practice on LeetCode/Codeforces"
                          >
                            <span>Solve</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogModalProps({
                                isOpen: true,
                                defaultPatternName: item.patternName,
                                defaultTopic: item.topic,
                              });
                            }}
                            className="px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border text-xs font-medium transition-colors"
                            title="Log new practice attempt"
                          >
                            Log Result
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Upcoming Practice Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Upcoming Problems to Practice ({upcomingProblems.length})</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Automatically scheduled on spaced intervals
          </span>
        </div>

        {upcomingProblems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-border bg-card/60 text-center text-muted-foreground text-xs shadow-sm">
            No upcoming problems scheduled under this filter.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Topic & Pattern</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Scheduled Practice</th>
                    <th className="py-3 px-3">Schedule Reason</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {upcomingProblems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (item.rawProblem) setSelectedProblem(item.rawProblem);
                      }}
                      className={`hover:bg-muted/60 transition-colors group ${
                        item.rawProblem ? 'cursor-pointer' : ''
                      }`}
                      title={item.rawProblem ? 'Click row to view problem details' : ''}
                    >
                      <td className="py-3 px-4 max-w-[220px]">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5 truncate"
                          title={item.title}
                        >
                          <span className="truncate">{item.title}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </a>
                      </td>

                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="text-foreground font-medium truncate">
                          {item.patternName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {item.topic}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <DifficultyBadge difficulty={item.difficulty} size="sm" />
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.status === 'Not Started' ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                            Not Started
                          </span>
                        ) : (
                          <StatusBadge status={item.status} size="sm" />
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {item.dueStatus.text}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                        {item.priorityReason}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <span>Solve</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Problem Modal for Logging Result */}
      <ProblemModal
        isOpen={logModalProps.isOpen}
        onClose={() => setLogModalProps({ isOpen: false })}
        defaultPatternName={logModalProps.defaultPatternName}
        defaultTopic={logModalProps.defaultTopic}
      />

      {/* Problem Detail Modal when clicking a problem */}
      <ProblemDetailModal
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
      />
    </div>
  );
};
