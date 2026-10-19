export type ConfidenceLevel = 'Weak' | 'Medium' | 'Strong';

export type PerformanceRating =
  | 'Could not solve independently'
  | 'Solved with a hint'
  | 'Solved independently'
  | 'Consistently strong';

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export type SolutionStatus = 'Solved Independently' | 'Solved with Hints' | 'Unsolved';

export type MistakeCategory =
  | 'Wrong boundary'
  | 'Wrong pattern'
  | 'Implementation bug'
  | 'Off-by-one'
  | 'Missed constraint'
  | 'Integer overflow'
  | 'TLE / Suboptimal'
  | 'Other';

export interface CanonicalProblem {
  title: string;
  url: string;
  difficulty: ProblemDifficulty;
  platform?: string;
}

export interface Pattern {
  _id?: string;
  id?: string;
  name: string;
  topic: string;
  subtopic?: string;
  confidence: ConfidenceLevel;
  intuition: string;
  recognitionSignals: string[];
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string[];
  canonicalProblems: CanonicalProblem[];
  lastRevised: string | null;
  nextRevision: string | null;
  revisionIntervalDays: number;
  revisionCount: number;
  independentSolvedCount: number;
  totalProblemsCount: number;
  notes?: string;
}

export interface RecognitionScore {
  identifiedPattern: boolean;
  derivedBruteForce: boolean;
  couldOptimize: boolean;
  implementedWithoutHelp: boolean;
}

export interface Problem {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  platform: 'LeetCode' | 'Codeforces' | 'GeeksforGeeks' | 'Other';
  topic: string;
  patternName: string;
  difficulty: ProblemDifficulty;
  status: SolutionStatus;
  solvedWithoutAI: boolean;
  timeTakenMinutes: number;
  attempts: number;
  recognitionScore: RecognitionScore;
  keyNotes: string;
  solvedAt: string;
}

export interface Mistake {
  _id?: string;
  id?: string;
  problemTitle: string;
  problemUrl?: string;
  topic: string;
  patternName: string;
  category: MistakeCategory;
  mistakeDescription: string;
  lessonLearned: string;
  createdAt: string;
}

export interface RevisionSession {
  _id?: string;
  id?: string;
  patternId?: string;
  patternName: string;
  topic: string;
  performanceRating: PerformanceRating;
  newConfidence: ConfidenceLevel;
  intervalDays: number;
  nextRevisionScheduled: string;
  sessionMinutes: number;
  routineCompleted: boolean;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatterns: number;
  patternsRevisedThisWeek: number;
  patternsDueTodayCount: number;
  patternsDueTodayList: Pattern[];
  weakPatterns: number;
  mediumPatterns: number;
  strongPatterns: number;
  totalProblems: number;
  independentProblems: number;
  hintProblems: number;
  unsolvedProblems: number;
  solvedWithoutAIProblems: number;
  revisionCompletionPercentage: number;
  totalMistakes: number;
  currentStreak: number;
  bestStreak: number;
  recognitionAverages: {
    identifiedPattern: number;
    derivedBruteForce: number;
    couldOptimize: number;
    implementedWithoutHelp: number;
  };
  topicBreakdown: Record<string, { total: number; strong: number; medium: number; weak: number; due: number }>;
  upcomingSchedule: Array<{ date: string; count: number; dayLabel: string }>;
}
