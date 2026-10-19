import { PerformanceRating, ConfidenceLevel } from '../types';

export const INTERVAL_LADDER = [1, 3, 7, 14, 30, 60, 90, 180, 365];

export interface ScheduleCalculationResult {
  nextIntervalDays: number;
  newConfidence: ConfidenceLevel;
  nextRevisionDate: Date;
}

export const calculateNextRevision = (
  rating: PerformanceRating,
  currentIntervalDays: number = 1
): ScheduleCalculationResult => {
  let nextIntervalDays = 1;
  let newConfidence: ConfidenceLevel = 'Weak';

  switch (rating) {
    case 'Could not solve independently':
      nextIntervalDays = 1;
      newConfidence = 'Weak';
      break;

    case 'Solved with a hint':
      nextIntervalDays = 3;
      newConfidence = 'Medium';
      break;

    case 'Solved independently':
      nextIntervalDays = 7;
      newConfidence = 'Strong';
      break;

    case 'Consistently strong':
      newConfidence = 'Strong';
      // Progressively advance through the ladder
      const currentIndex = INTERVAL_LADDER.indexOf(currentIntervalDays);
      if (currentIndex !== -1 && currentIndex < INTERVAL_LADDER.length - 1) {
        nextIntervalDays = INTERVAL_LADDER[currentIndex + 1];
      } else if (currentIndex === -1) {
        if (currentIntervalDays < 7) nextIntervalDays = 14;
        else if (currentIntervalDays < 14) nextIntervalDays = 30;
        else if (currentIntervalDays < 30) nextIntervalDays = 60;
        else nextIntervalDays = 90;
      } else {
        nextIntervalDays = 365;
      }
      break;

    default:
      nextIntervalDays = 3;
      newConfidence = 'Medium';
  }

  const now = new Date();
  const nextRevisionDate = new Date(now.getTime() + nextIntervalDays * 86400000);

  return {
    nextIntervalDays,
    newConfidence,
    nextRevisionDate,
  };
};

export const isPatternDue = (nextRevisionStr: string | null | undefined): boolean => {
  if (!nextRevisionStr) return true;
  const nextDate = new Date(nextRevisionStr);
  const now = new Date();
  return nextDate.getTime() <= now.getTime();
};

export const getDueStatusText = (nextRevisionStr: string | null | undefined): { text: string; isOverdue: boolean; isDueToday: boolean } => {
  if (!nextRevisionStr) return { text: 'Due Now', isOverdue: false, isDueToday: true };
  const nextDate = new Date(nextRevisionStr);
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`,
      isOverdue: true,
      isDueToday: true,
    };
  }

  if (diffDays === 0) {
    return { text: 'Due Today', isOverdue: false, isDueToday: true };
  }

  if (diffDays === 1) {
    return { text: 'Due Tomorrow', isOverdue: false, isDueToday: false };
  }

  if (diffDays < 30) {
    return { text: `Due in ${diffDays} days`, isOverdue: false, isDueToday: false };
  }

  const diffMonths = Math.round(diffDays / 30);
  return { text: `Due in ${diffMonths} month${diffMonths > 1 ? 's' : ''}`, isOverdue: false, isDueToday: false };
};
