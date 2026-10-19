import { Problem, ConfidenceLevel, Pattern } from '../types';

export interface PatternConfidenceStats {
  confidence: ConfidenceLevel;
  scorePercent: number;
  totalProblems: number;
  independentCount: number;
  hintCount: number;
  unsolvedCount: number;
  noAiCount: number;
  avgRecognitionScore: number;
  hasProblems: boolean;
}

export const calculatePatternConfidenceFromProblems = (
  pattern: Pattern,
  problems: Problem[]
): PatternConfidenceStats => {
  const patternProblems = problems.filter(
    (p) => p.patternName?.trim().toLowerCase() === pattern.name?.trim().toLowerCase()
  );

  if (patternProblems.length === 0) {
    const fallbackConfidence: ConfidenceLevel = pattern.confidence || 'Weak';
    const fallbackScore =
      fallbackConfidence === 'Strong' ? 85 : fallbackConfidence === 'Medium' ? 60 : 30;

    return {
      confidence: fallbackConfidence,
      scorePercent: fallbackScore,
      totalProblems: 0,
      independentCount: 0,
      hintCount: 0,
      unsolvedCount: 0,
      noAiCount: 0,
      avgRecognitionScore: 0,
      hasProblems: false,
    };
  }

  let totalScore = 0;
  let independentCount = 0;
  let hintCount = 0;
  let unsolvedCount = 0;
  let noAiCount = 0;
  let totalRecCheckCount = 0;

  for (const prob of patternProblems) {
    // 1. Status Weight (45%)
    let statusScore = 0;
    if (prob.status === 'Solved Independently') {
      statusScore = 100;
      independentCount++;
    } else if (prob.status === 'Solved with Hints') {
      statusScore = 50;
      hintCount++;
    } else {
      statusScore = 10;
      unsolvedCount++;
    }

    // 2. Recognition Audit Weight (40%)
    const recCount = [
      prob.recognitionScore?.identifiedPattern,
      prob.recognitionScore?.derivedBruteForce,
      prob.recognitionScore?.couldOptimize,
      prob.recognitionScore?.implementedWithoutHelp,
    ].filter(Boolean).length;
    totalRecCheckCount += recCount;
    const recognitionScore = (recCount / 4) * 100;

    // 3. AI / Independent Weight (15%)
    if (prob.solvedWithoutAI) {
      noAiCount++;
    }
    const aiScore = prob.solvedWithoutAI ? 100 : 50;

    const probScore = statusScore * 0.45 + recognitionScore * 0.40 + aiScore * 0.15;
    totalScore += probScore;
  }

  const scorePercent = Math.round(totalScore / patternProblems.length);
  const avgRecognitionScore = Number((totalRecCheckCount / patternProblems.length).toFixed(1));

  let confidence: ConfidenceLevel = 'Weak';
  if (scorePercent >= 75) {
    confidence = 'Strong';
  } else if (scorePercent >= 45) {
    confidence = 'Medium';
  } else {
    confidence = 'Weak';
  }

  return {
    confidence,
    scorePercent,
    totalProblems: patternProblems.length,
    independentCount,
    hintCount,
    unsolvedCount,
    noAiCount,
    avgRecognitionScore,
    hasProblems: true,
  };
};
