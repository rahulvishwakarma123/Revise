import React from 'react';
import { SolutionStatus } from '../../types';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface Props {
  status: SolutionStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (status) {
    case 'Solved Independently':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClass}`}>
          <CheckCircle2 className="w-3 h-3" />
          <span>Independent</span>
        </span>
      );
    case 'Solved with Hints':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${sizeClass}`}>
          <HelpCircle className="w-3 h-3" />
          <span>With Hints</span>
        </span>
      );
    case 'Unsolved':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${sizeClass}`}>
          <XCircle className="w-3 h-3" />
          <span>Unsolved</span>
        </span>
      );
    default:
      return null;
  }
};
