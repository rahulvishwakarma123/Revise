import React from 'react';
import { MetricCards } from './MetricCards';
import { DueTodayBanner } from './DueTodayBanner';
import { RetentionChart } from './RetentionChart';
import { RecognitionScoreCard } from './RecognitionScoreCard';
import { TopicMasteryList } from './TopicMasteryList';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Top Summary Metric Cards */}
      <MetricCards />

      {/* 2. Due Today Active Recall Callout Banner */}
      <DueTodayBanner />

      {/* 3. Spaced Repetition Forecast & Confidence Breakdown Charts */}
      <RetentionChart />

      {/* 4. Pattern Recognition Score & Interview Audit */}
      <RecognitionScoreCard />

      {/* 5. DSA Roadmap Topic Progress */}
      <TopicMasteryList />
    </div>
  );
};
