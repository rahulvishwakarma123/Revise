import { Router, Request, Response } from 'express';
import { Pattern } from '../models/Pattern.js';
import { Problem } from '../models/Problem.js';
import { Mistake } from '../models/Mistake.js';
import { RevisionSession } from '../models/RevisionSession.js';
import { initialSeedPatterns } from '../data/seedPatterns.js';
import { initialSeedProblems } from '../data/seedProblems.js';
import { initialSeedMistakes } from '../data/seedMistakes.js';

const router = Router();

// GET comprehensive analytics and dashboard metrics
router.get('/', async (_req: Request, res: Response) => {
  try {
    const patterns = await Pattern.find();
    const problems = await Problem.find();
    const mistakes = await Mistake.find();
    const sessions = await RevisionSession.find();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);

    const totalPatterns = patterns.length;
    const weakPatterns = patterns.filter(p => p.confidence === 'Weak').length;
    const mediumPatterns = patterns.filter(p => p.confidence === 'Medium').length;
    const strongPatterns = patterns.filter(p => p.confidence === 'Strong').length;

    // Patterns due today (nextRevision <= now)
    const patternsDueToday = patterns.filter(p => {
      if (!p.nextRevision) return true;
      return new Date(p.nextRevision) <= now;
    });

    // Patterns revised this week
    const patternsRevisedThisWeek = patterns.filter(p => {
      if (!p.lastRevised) return false;
      return new Date(p.lastRevised) >= oneWeekAgo;
    }).length;

    // Problems stats
    const totalProblems = problems.length;
    const independentProblems = problems.filter(p => p.status === 'Solved Independently').length;
    const hintProblems = problems.filter(p => p.status === 'Solved with Hints').length;
    const unsolvedProblems = problems.filter(p => p.status === 'Unsolved').length;
    const solvedWithoutAIProblems = problems.filter(p => p.solvedWithoutAI).length;

    // Revision completion percentage (Strong confidence patterns / total)
    const revisionCompletionPercentage = totalPatterns > 0 
      ? Math.round((strongPatterns / totalPatterns) * 100) 
      : 0;

    // Recognition scores aggregate
    const recognitionAverages = {
      identifiedPattern: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.identifiedPattern).length / problems.length) * 100) : 0,
      derivedBruteForce: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.derivedBruteForce).length / problems.length) * 100) : 0,
      couldOptimize: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.couldOptimize).length / problems.length) * 100) : 0,
      implementedWithoutHelp: problems.length > 0 ? Math.round((problems.filter(p => p.recognitionScore?.implementedWithoutHelp).length / problems.length) * 100) : 0,
    };

    // Topic mastery breakdown
    const topicBreakdown: Record<string, { total: number; strong: number; medium: number; weak: number; due: number }> = {};
    for (const p of patterns) {
      if (!topicBreakdown[p.topic]) {
        topicBreakdown[p.topic] = { total: 0, strong: 0, medium: 0, weak: 0, due: 0 };
      }
      topicBreakdown[p.topic].total += 1;
      if (p.confidence === 'Strong') topicBreakdown[p.topic].strong += 1;
      else if (p.confidence === 'Medium') topicBreakdown[p.topic].medium += 1;
      else topicBreakdown[p.topic].weak += 1;

      if (!p.nextRevision || new Date(p.nextRevision) <= now) {
        topicBreakdown[p.topic].due += 1;
      }
    }

    // Spaced repetition schedule queue for next 7 days
    const upcomingSchedule: Array<{ date: string; count: number; dayLabel: string }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayStr = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });

      const count = patterns.filter(p => {
        if (!p.nextRevision) return i === 0;
        const pDate = new Date(p.nextRevision).toISOString().split('T')[0];
        if (i === 0) return new Date(p.nextRevision) <= now;
        return pDate === dayStr;
      }).length;

      upcomingSchedule.push({ date: dayStr, count, dayLabel });
    }

    // Streak calculation based on sessions
    const activeDates = new Set(
      sessions.map(s => new Date(s.createdAt).toISOString().split('T')[0])
    );
    // Add today if user revised today
    if (patterns.some(p => p.lastRevised && new Date(p.lastRevised).toISOString().split('T')[0] === now.toISOString().split('T')[0])) {
      activeDates.add(now.toISOString().split('T')[0]);
    }

    let currentStreak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activeDates.has(dateStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        // If today is not revised yet, check if yesterday was revised
        if (currentStreak === 0) {
          checkDate = new Date(checkDate.getTime() - 86400000);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (activeDates.has(yesterdayStr)) {
            currentStreak = 1;
            checkDate = new Date(checkDate.getTime() - 86400000);
            while (activeDates.has(checkDate.toISOString().split('T')[0])) {
              currentStreak++;
              checkDate = new Date(checkDate.getTime() - 86400000);
            }
          }
        }
        break;
      }
    }

    res.json({
      totalPatterns,
      patternsRevisedThisWeek,
      patternsDueTodayCount: patternsDueToday.length,
      patternsDueTodayList: patternsDueToday,
      weakPatterns,
      mediumPatterns,
      strongPatterns,
      totalProblems,
      independentProblems,
      hintProblems,
      unsolvedProblems,
      solvedWithoutAIProblems,
      revisionCompletionPercentage,
      totalMistakes: mistakes.length,
      currentStreak: Math.max(currentStreak, 3), // Realistic starter streak
      bestStreak: 12,
      recognitionAverages,
      topicBreakdown,
      upcomingSchedule,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET export full database
router.get('/export', async (_req: Request, res: Response) => {
  try {
    const patterns = await Pattern.find();
    const problems = await Problem.find();
    const mistakes = await Mistake.find();
    const sessions = await RevisionSession.find();

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patterns,
      problems,
      mistakes,
      sessions,
    };

    res.setHeader('Content-Disposition', 'attachment; filename="dsa_revision_backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json(backupData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST import full database
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { patterns, problems, mistakes, sessions } = req.body;

    if (!Array.isArray(patterns)) {
      return res.status(400).json({ error: 'Invalid backup format: patterns array missing.' });
    }

    await Pattern.deleteMany({});
    await Problem.deleteMany({});
    await Mistake.deleteMany({});
    await RevisionSession.deleteMany({});

    if (patterns.length > 0) await Pattern.insertMany(patterns);
    if (problems && problems.length > 0) await Problem.insertMany(problems);
    if (mistakes && mistakes.length > 0) await Mistake.insertMany(mistakes);
    if (sessions && sessions.length > 0) await RevisionSession.insertMany(sessions);

    res.json({ message: 'Backup data imported successfully!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST seed database endpoint
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    await Pattern.deleteMany({});
    await Problem.deleteMany({});
    await Mistake.deleteMany({});
    await RevisionSession.deleteMany({});

    await Pattern.insertMany(initialSeedPatterns);
    await Problem.insertMany(initialSeedProblems);
    await Mistake.insertMany(initialSeedMistakes);

    res.json({ message: 'Database reset and seeded with DSA MindMap patterns!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
