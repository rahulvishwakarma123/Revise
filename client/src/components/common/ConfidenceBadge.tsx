import React from 'react';
import { ConfidenceLevel } from '../../types';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface Props {
  confidence: ConfidenceLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<Props> = ({ confidence, showIcon = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  if (confidence === 'Strong') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}>
        {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
        <span>Strong</span>
      </span>
    );
  }

  if (confidence === 'Medium') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}>
        {showIcon && <Shield className="w-3.5 h-3.5" />}
        <span>Medium</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${sizeClasses[size]}`}>
      {showIcon && <ShieldAlert className="w-3.5 h-3.5" />}
      <span>Weak</span>
    </span>
  );
};
