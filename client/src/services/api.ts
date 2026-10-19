import { Pattern, Problem, Mistake, RevisionSession, DashboardStats, PerformanceRating } from '../types';
import { initialPatterns, initialProblems, initialMistakes, initialSessions } from '../data/initialData';
import { calculateNextRevision } from './scheduler';

const API_BASE = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  PATTERNS: 'dsa_patterns_data',
  PROBLEMS: 'dsa_problems_data',
  MISTAKES: 'dsa_mistakes_data',
  SESSIONS: 'dsa_sessions_data',
};

// Check if backend is reachable
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
};

// Local storage helpers
export const getLocal = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};

// API Services with local fallback
export const api = {
  // --- PATTERNS ---
  async getPatterns(): Promise<Pattern[]> {
    try {
      const res = await fetch(`${API_BASE}/patterns`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.PATTERNS, data);
        return data;
      }
    } catch {}
    return getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
  },

  async createPattern(pattern: Partial<Pattern>): Promise<Pattern> {
    try {
      const res = await fetch(`${API_BASE}/patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pattern),
      });
      if (res.ok) return await res.json();
    } catch {}
    const list = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const newPattern: Pattern = {
      id: 'local_' + Date.now(),
      name: pattern.name || 'Untitled Pattern',
      topic: pattern.topic || 'Arrays',
      subtopic: pattern.subtopic || '',
      confidence: pattern.confidence || 'Weak',
      intuition: pattern.intuition || '',
      recognitionSignals: pattern.recognitionSignals || [],
      timeComplexity: pattern.timeComplexity || 'O(N)',
      spaceComplexity: pattern.spaceComplexity || 'O(1)',
      edgeCases: pattern.edgeCases || [],
      canonicalProblems: pattern.canonicalProblems || [],
      lastRevised: null,
      nextRevision: new Date().toISOString(),
      revisionIntervalDays: 1,
      revisionCount: 0,
      independentSolvedCount: 0,
      totalProblemsCount: 0,
      notes: pattern.notes || '',
    };
    list.unshift(newPattern);
    setLocal(STORAGE_KEYS.PATTERNS, list);
    return newPattern;
  },

  async updatePattern(id: string, updates: Partial<Pattern>): Promise<Pattern | null> {
    try {
      const res = await fetch(`${API_BASE}/patterns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {}
    const list = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const index = list.findIndex(p => p._id === id || p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      setLocal(STORAGE_KEYS.PATTERNS, list);
      return list[index];
    }
    return null;
  },

  async deletePattern(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/patterns/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}
    const list = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const updated = list.filter(p => p._id !== id && p.id !== id);
    setLocal(STORAGE_KEYS.PATTERNS, updated);
    return true;
  },

  async reviewPattern(
    id: string, 
    performanceRating: PerformanceRating, 
    notes?: string,
    sessionMinutes?: number,
    routineCompleted?: boolean
  ): Promise<{ pattern: Pattern; session: RevisionSession }> {
    try {
      const res = await fetch(`${API_BASE}/patterns/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performanceRating, notes, sessionMinutes, routineCompleted }),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback logic
    const patterns = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const pattern = patterns.find(p => p._id === id || p.id === id);
    if (!pattern) throw new Error('Pattern not found');

    const schedule = calculateNextRevision(performanceRating, pattern.revisionIntervalDays);
    const now = new Date();

    pattern.confidence = schedule.newConfidence;
    pattern.lastRevised = now.toISOString();
    pattern.nextRevision = schedule.nextRevisionDate.toISOString();
    pattern.revisionIntervalDays = schedule.nextIntervalDays;
    pattern.revisionCount += 1;
    if (performanceRating === 'Solved independently' || performanceRating === 'Consistently strong') {
      pattern.independentSolvedCount += 1;
    }
    if (notes) pattern.notes = notes;

    setLocal(STORAGE_KEYS.PATTERNS, patterns);

    const session: RevisionSession = {
      id: 'session_' + Date.now(),
      patternId: id,
      patternName: pattern.name,
      topic: pattern.topic,
      performanceRating,
      newConfidence: schedule.newConfidence,
      intervalDays: schedule.nextIntervalDays,
      nextRevisionScheduled: schedule.nextRevisionDate.toISOString(),
      sessionMinutes: sessionMinutes || 60,
      routineCompleted: !!routineCompleted,
      notes: notes || '',
      createdAt: now.toISOString(),
    };

    const sessions = getLocal<RevisionSession[]>(STORAGE_KEYS.SESSIONS, initialSessions);
    sessions.unshift(session);
    setLocal(STORAGE_KEYS.SESSIONS, sessions);

    return { pattern, session };
  },

  // --- PROBLEMS ---
  async getProblems(): Promise<Problem[]> {
    try {
      const res = await fetch(`${API_BASE}/problems`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.PROBLEMS, data);
        return data;
      }
    } catch {}
    return getLocal<Problem[]>(STORAGE_KEYS.PROBLEMS, initialProblems);
  },

  async createProblem(problem: Partial<Problem>): Promise<Problem> {
    try {
      const res = await fetch(`${API_BASE}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problem),
      });
      if (res.ok) return await res.json();
    } catch {}
    const list = getLocal<Problem[]>(STORAGE_KEYS.PROBLEMS, initialProblems);
    const newProblem: Problem = {
      id: 'prob_' + Date.now(),
      title: problem.title || 'Untitled Problem',
      url: problem.url || 'https://leetcode.com',
      platform: problem.platform || 'LeetCode',
      topic: problem.topic || 'Arrays',
      patternName: problem.patternName || 'Sliding Window',
      difficulty: problem.difficulty || 'Medium',
      status: problem.status || 'Solved Independently',
      solvedWithoutAI: problem.solvedWithoutAI ?? true,
      timeTakenMinutes: problem.timeTakenMinutes || 20,
      attempts: problem.attempts || 1,
      recognitionScore: problem.recognitionScore || {
        identifiedPattern: true,
        derivedBruteForce: true,
        couldOptimize: true,
        implementedWithoutHelp: true,
      },
      keyNotes: problem.keyNotes || '',
      solvedAt: new Date().toISOString(),
    };
    list.unshift(newProblem);
    setLocal(STORAGE_KEYS.PROBLEMS, list);

    // Update pattern counters
    const patterns = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const targetPattern = patterns.find(p => p.name === newProblem.patternName);
    if (targetPattern) {
      targetPattern.totalProblemsCount = (targetPattern.totalProblemsCount || 0) + 1;
      if (newProblem.status === 'Solved Independently') {
        targetPattern.independentSolvedCount = (targetPattern.independentSolvedCount || 0) + 1;
      }
      setLocal(STORAGE_KEYS.PATTERNS, patterns);
    }

    return newProblem;
  },

  async deleteProblem(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/problems/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}
    const list = getLocal<Problem[]>(STORAGE_KEYS.PROBLEMS, initialProblems);
    const updated = list.filter(p => p._id !== id && p.id !== id);
    setLocal(STORAGE_KEYS.PROBLEMS, updated);
    return true;
  },

  // --- MISTAKES ---
  async getMistakes(): Promise<Mistake[]> {
    try {
      const res = await fetch(`${API_BASE}/mistakes`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.MISTAKES, data);
        return data;
      }
    } catch {}
    return getLocal<Mistake[]>(STORAGE_KEYS.MISTAKES, initialMistakes);
  },

  async createMistake(mistake: Partial<Mistake>): Promise<Mistake> {
    try {
      const res = await fetch(`${API_BASE}/mistakes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mistake),
      });
      if (res.ok) return await res.json();
    } catch {}
    const list = getLocal<Mistake[]>(STORAGE_KEYS.MISTAKES, initialMistakes);
    const newMistake: Mistake = {
      id: 'mistake_' + Date.now(),
      problemTitle: mistake.problemTitle || 'Untitled Problem',
      problemUrl: mistake.problemUrl || '',
      topic: mistake.topic || 'Arrays',
      patternName: mistake.patternName || 'Sliding Window',
      category: mistake.category || 'Wrong boundary',
      mistakeDescription: mistake.mistakeDescription || '',
      lessonLearned: mistake.lessonLearned || '',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newMistake);
    setLocal(STORAGE_KEYS.MISTAKES, list);
    return newMistake;
  },

  async deleteMistake(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/mistakes/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}
    const list = getLocal<Mistake[]>(STORAGE_KEYS.MISTAKES, initialMistakes);
    const updated = list.filter(m => m._id !== id && m.id !== id);
    setLocal(STORAGE_KEYS.MISTAKES, updated);
    return true;
  },

  // --- SESSIONS ---
  async getSessions(): Promise<RevisionSession[]> {
    try {
      const res = await fetch(`${API_BASE}/sessions`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) return await res.json();
    } catch {}
    return getLocal<RevisionSession[]>(STORAGE_KEYS.SESSIONS, initialSessions);
  },

  // --- STATS ---
  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/stats`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) return await res.json();
    } catch {}

    // Local compute
    const patterns = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const problems = getLocal<Problem[]>(STORAGE_KEYS.PROBLEMS, initialProblems);
    const mistakes = getLocal<Mistake[]>(STORAGE_KEYS.MISTAKES, initialMistakes);
    const sessions = getLocal<RevisionSession[]>(STORAGE_KEYS.SESSIONS, initialSessions);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);

    const totalPatterns = patterns.length;
    const weakPatterns = patterns.filter(p => p.confidence === 'Weak').length;
    const mediumPatterns = patterns.filter(p => p.confidence === 'Medium').length;
    const strongPatterns = patterns.filter(p => p.confidence === 'Strong').length;

    const patternsDueToday = patterns.filter(p => {
      if (!p.nextRevision) return true;
      return new Date(p.nextRevision) <= now;
    });

    const patternsRevisedThisWeek = patterns.filter(p => {
      if (!p.lastRevised) return false;
      return new Date(p.lastRevised) >= oneWeekAgo;
    }).length;

    const independentProblems = problems.filter(p => p.status === 'Solved Independently').length;
    const hintProblems = problems.filter(p => p.status === 'Solved with Hints').length;
    const unsolvedProblems = problems.filter(p => p.status === 'Unsolved').length;
    const solvedWithoutAIProblems = problems.filter(p => p.solvedWithoutAI).length;

    const revisionCompletionPercentage = totalPatterns > 0 
      ? Math.round((strongPatterns / totalPatterns) * 100) 
      : 0;

    const topicBreakdown: Record<string, { total: number; strong: number; medium: number; weak: number; due: number }> = {};
    for (const p of patterns) {
      if (!topicBreakdown[p.topic]) {
        topicBreakdown[p.topic] = { total: 0, strong: 0, medium: 0, weak: 0, due: 0 };
      }
      topicBreakdown[p.topic].total += 1;
      if (p.confidence === 'Strong') topicBreakdown[p.topic].strong += 1;
      else if (p.confidence === 'Medium') topicBreakdown[p.topic].medium += 1;
      else topicBreakdown[p.topic].weak += 1;

      if (!p.nextRevision || new Date(p.nextRevision) <= now) {
        topicBreakdown[p.topic].due += 1;
      }
    }

    const upcomingSchedule: Array<{ date: string; count: number; dayLabel: string }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayStr = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = patterns.filter(p => {
        if (!p.nextRevision) return i === 0;
        const pDate = new Date(p.nextRevision).toISOString().split('T')[0];
        if (i === 0) return new Date(p.nextRevision) <= now;
        return pDate === dayStr;
      }).length;
      upcomingSchedule.push({ date: dayStr, count, dayLabel });
    }

    return {
      totalPatterns,
      patternsRevisedThisWeek,
      patternsDueTodayCount: patternsDueToday.length,
      patternsDueTodayList: patternsDueToday,
      weakPatterns,
      mediumPatterns,
      strongPatterns,
      totalProblems: problems.length,
      independentProblems,
      hintProblems,
      unsolvedProblems,
      solvedWithoutAIProblems,
      revisionCompletionPercentage,
      totalMistakes: mistakes.length,
      currentStreak: 4,
      bestStreak: 12,
      recognitionAverages: {
        identifiedPattern: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.identifiedPattern).length / problems.length) * 100) : 0,
        derivedBruteForce: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.derivedBruteForce).length / problems.length) * 100) : 0,
        couldOptimize: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.couldOptimize).length / problems.length) * 100) : 0,
        implementedWithoutHelp: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.implementedWithoutHelp).length / problems.length) * 100) : 0,
      },
      topicBreakdown,
      upcomingSchedule,
    };
  },

  // --- EXPORT & IMPORT ---
  exportBackup(): string {
    const patterns = getLocal<Pattern[]>(STORAGE_KEYS.PATTERNS, initialPatterns);
    const problems = getLocal<Problem[]>(STORAGE_KEYS.PROBLEMS, initialProblems);
    const mistakes = getLocal<Mistake[]>(STORAGE_KEYS.MISTAKES, initialMistakes);
    const sessions = getLocal<RevisionSession[]>(STORAGE_KEYS.SESSIONS, initialSessions);
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patterns,
      problems,
      mistakes,
      sessions,
    }, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.patterns && Array.isArray(data.patterns)) {
        setLocal(STORAGE_KEYS.PATTERNS, data.patterns);
      }
      if (data.problems && Array.isArray(data.problems)) {
        setLocal(STORAGE_KEYS.PROBLEMS, data.problems);
      }
      if (data.mistakes && Array.isArray(data.mistakes)) {
        setLocal(STORAGE_KEYS.MISTAKES, data.mistakes);
      }
      if (data.sessions && Array.isArray(data.sessions)) {
        setLocal(STORAGE_KEYS.SESSIONS, data.sessions);
      }
      return true;
    } catch {
      return false;
    }
  },

  resetToInitialData(): void {
    setLocal(STORAGE_KEYS.PATTERNS, initialPatterns);
    setLocal(STORAGE_KEYS.PROBLEMS, initialProblems);
    setLocal(STORAGE_KEYS.MISTAKES, initialMistakes);
    setLocal(STORAGE_KEYS.SESSIONS, initialSessions);
  }
};
