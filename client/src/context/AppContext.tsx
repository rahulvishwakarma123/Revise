import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Pattern, Problem, Mistake, RevisionSession, DashboardStats, PerformanceRating } from '../types';
import { api, checkBackendHealth } from '../services/api';
import confetti from 'canvas-confetti';

interface AppContextType {
  patterns: Pattern[];
  problems: Problem[];
  mistakes: Mistake[];
  sessions: RevisionSession[];
  stats: DashboardStats | null;
  isBackendConnected: boolean;
  isLoading: boolean;
  activeTab: 'dashboard' | 'roadmap' | 'problems' | 'mistakes' | 'scheduler';
  setActiveTab: (tab: 'dashboard' | 'roadmap' | 'problems' | 'mistakes' | 'scheduler') => void;
  selectedPattern: Pattern | null;
  setSelectedPattern: (p: Pattern | null) => void;
  activeRecallPattern: Pattern | null;
  setActiveRecallPattern: (p: Pattern | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTopicFilter: string;
  setSelectedTopicFilter: (topic: string) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  startActiveRecall: (pattern: Pattern) => void;
  completeActiveRecall: (rating: PerformanceRating, notes?: string, sessionMinutes?: number, routineCompleted?: boolean) => Promise<void>;
  addProblem: (problem: Partial<Problem>) => Promise<Problem>;
  deleteProblem: (id: string) => Promise<void>;
  addMistake: (mistake: Partial<Mistake>) => Promise<Mistake>;
  deleteMistake: (id: string) => Promise<void>;
  addPattern: (pattern: Partial<Pattern>) => Promise<Pattern>;
  updatePattern: (id: string, updates: Partial<Pattern>) => Promise<void>;
  deletePattern: (id: string) => Promise<void>;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetDefaults: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roadmap' | 'problems' | 'mistakes' | 'scheduler'>('dashboard');
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [activeRecallPattern, setActiveRecallPattern] = useState<Pattern | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('All');

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const isConnected = await checkBackendHealth();
      setIsBackendConnected(isConnected);

      const [pats, probs, mists, sess, statistics] = await Promise.all([
        api.getPatterns(),
        api.getProblems(),
        api.getMistakes(),
        api.getSessions(),
        api.getStats(),
      ]);

      setPatterns(pats);
      setProblems(probs);
      setMistakes(mists);
      setSessions(sess);
      setStats(statistics);
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const startActiveRecall = (pattern: Pattern) => {
    setActiveRecallPattern(pattern);
  };

  const completeActiveRecall = async (
    rating: PerformanceRating, 
    notes?: string, 
    sessionMinutes?: number, 
    routineCompleted?: boolean
  ) => {
    if (!activeRecallPattern) return;
    const targetId = activeRecallPattern._id || activeRecallPattern.id || '';
    
    await api.reviewPattern(targetId, rating, notes, sessionMinutes, routineCompleted);
    
    // Trigger celebratory confetti on high recall performance
    if (rating === 'Solved independently' || rating === 'Consistently strong') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    setActiveRecallPattern(null);
    await refreshData();
  };

  const addProblem = async (problem: Partial<Problem>): Promise<Problem> => {
    const created = await api.createProblem(problem);
    await refreshData();
    return created;
  };

  const deleteProblem = async (id: string) => {
    await api.deleteProblem(id);
    await refreshData();
  };

  const addMistake = async (mistake: Partial<Mistake>): Promise<Mistake> => {
    const created = await api.createMistake(mistake);
    await refreshData();
    return created;
  };

  const deleteMistake = async (id: string) => {
    await api.deleteMistake(id);
    await refreshData();
  };

  const addPattern = async (pattern: Partial<Pattern>): Promise<Pattern> => {
    const created = await api.createPattern(pattern);
    await refreshData();
    return created;
  };

  const updatePattern = async (id: string, updates: Partial<Pattern>) => {
    await api.updatePattern(id, updates);
    await refreshData();
  };

  const deletePattern = async (id: string) => {
    await api.deletePattern(id);
    await refreshData();
  };

  const exportData = (): string => {
    return api.exportBackup();
  };

  const importData = (jsonStr: string): boolean => {
    const success = api.importBackup(jsonStr);
    if (success) {
      refreshData();
    }
    return success;
  };

  const resetDefaults = async () => {
    api.resetToInitialData();
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        patterns,
        problems,
        mistakes,
        sessions,
        stats,
        isBackendConnected,
        isLoading,
        activeTab,
        setActiveTab,
        selectedPattern,
        setSelectedPattern,
        activeRecallPattern,
        setActiveRecallPattern,
        searchQuery,
        setSearchQuery,
        selectedTopicFilter,
        setSelectedTopicFilter,
        refreshData,
        startActiveRecall,
        completeActiveRecall,
        addProblem,
        deleteProblem,
        addMistake,
        deleteMistake,
        addPattern,
        updatePattern,
        deletePattern,
        exportData,
        importData,
        resetDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
