import React from 'react';
import { ProblemDifficulty } from '../../types';

interface Props {
  difficulty: ProblemDifficulty;
  size?: 'sm' | 'md';
}

export const DifficultyBadge: React.FC<Props> = ({ difficulty, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (difficulty) {
    case 'Easy':
      return (
        <span className={`inline-flex items-center rounded font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${sizeClass}`}>
          Easy
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center rounded font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${sizeClass}`}>
          Medium
        </span>
      );
    case 'Hard':
      return (
        <span className={`inline-flex items-center rounded font-mono font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${sizeClass}`}>
          Hard
        </span>
      );
    default:
      return null;
  }
};
