import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { CalendarDays, PieChart as PieIcon } from 'lucide-react';

export const RetentionChart: React.FC = () => {
  const { stats } = useApp();

  if (!stats) return null;

  // Confidence pie data
  const confidenceData = [
    { name: 'Strong', value: stats.strongPatterns, color: '#10b981' }, // Emerald
    { name: 'Medium', value: stats.mediumPatterns, color: '#f59e0b' }, // Amber
    { name: 'Weak', value: stats.weakPatterns, color: '#f43f5e' }, // Rose
  ];

  const total = stats.totalPatterns || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 7-Day Spaced Repetition Queue Bar Chart */}
      <div className="lg:col-span-2 p-5 rounded-3xl bg-card border border-border shadow-sm text-card-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              7-Day Spaced Repetition Forecast
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled active recall workload over the upcoming week
            </p>
          </div>
          <span className="text-xs font-mono text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            Automated Spacing
          </span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.upcomingSchedule} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="dayLabel"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--card-foreground)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: any) => [`${value} patterns due`, 'Workload']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.upcomingSchedule.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#f43f5e' : index === 1 ? '#f59e0b' : 'var(--primary)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence Level Distribution */}
      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between text-card-foreground">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Confidence Distribution
            </h4>
            <span className="text-xs font-mono text-primary">
              {stats.revisionCompletionPercentage}% Ready
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Distinguishing familiar topics from interview-ready topics
          </p>

          <div className="h-36 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--card-foreground)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-foreground">Strong (Independent)</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {stats.strongPatterns} ({Math.round((stats.strongPatterns / total) * 100)}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-foreground">Medium (Need Hints)</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {stats.mediumPatterns} ({Math.round((stats.mediumPatterns / total) * 100)}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-foreground">Weak (Struggling)</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {stats.weakPatterns} ({Math.round((stats.weakPatterns / total) * 100)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
