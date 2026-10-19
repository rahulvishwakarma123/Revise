import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Award, Zap, Code } from 'lucide-react';

export const RecognitionScoreCard: React.FC = () => {
  const { stats } = useApp();

  if (!stats) return null;

  const recognitionItems = [
    {
      label: 'Identified Pattern Correctly',
      description: 'Recognized correct technique before viewing editorial/hints',
      percentage: stats.recognitionAverages.identifiedPattern,
      color: 'bg-primary',
      icon: Target,
    },
    {
      label: 'Derived Brute-Force Approach',
      description: 'Formulated naive baseline O(N²) / exponential approach first',
      percentage: stats.recognitionAverages.derivedBruteForce,
      color: 'bg-emerald-500',
      icon: Code,
    },
    {
      label: 'Optimized Time/Space',
      description: 'Reduced complexity to optimal Big-O bound independently',
      percentage: stats.recognitionAverages.couldOptimize,
      color: 'bg-purple-500',
      icon: Zap,
    },
    {
      label: 'Implemented & Dry-Ran Without Help',
      description: 'Coded edge cases and simulated trace without AI or hints',
      percentage: stats.recognitionAverages.implementedWithoutHelp,
      color: 'bg-amber-500',
      icon: Award,
    },
  ];

  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-card border border-border shadow-sm text-card-foreground">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Pattern Recognition & Interview Readiness Score
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Key self-evaluation metrics across all practice problems for timed interview contests
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          Contest Ready
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recognitionItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">{item.label}</span>
                </div>
                <span className="text-xs font-mono font-bold text-foreground">
                  {item.percentage}%
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
