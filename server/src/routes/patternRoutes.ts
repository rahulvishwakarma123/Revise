import { Router, Request, Response } from 'express';
import { Pattern } from '../models/Pattern.js';
import { RevisionSession } from '../models/RevisionSession.js';

const router = Router();

// GET all patterns with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { topic, confidence, dueOnly, search } = req.query;
    const filter: any = {};

    if (topic && topic !== 'All') {
      filter.topic = topic;
    }
    if (confidence && confidence !== 'All') {
      filter.confidence = confidence;
    }
    if (dueOnly === 'true') {
      filter.nextRevision = { $lte: new Date() };
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { topic: searchRegex },
        { subtopic: searchRegex },
        { intuition: searchRegex },
        { recognitionSignals: searchRegex }
      ];
    }

    const patterns = await Pattern.find(filter).sort({ nextRevision: 1, topic: 1 });
    res.json(patterns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single pattern
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' });
    res.json(pattern);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create pattern
router.post('/', async (req: Request, res: Response) => {
  try {
    const pattern = new Pattern(req.body);
    await pattern.save();
    res.status(201).json(pattern);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update pattern
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const pattern = await Pattern.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' });
    res.json(pattern);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE pattern
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pattern = await Pattern.findByIdAndDelete(req.params.id);
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' });
    res.json({ message: 'Pattern deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST Review pattern (Spaced repetition engine)
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const { performanceRating, notes, sessionMinutes, routineCompleted } = req.body;
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ error: 'Pattern not found' });

    let nextIntervalDays = 1;
    let newConfidence: 'Weak' | 'Medium' | 'Strong' = 'Weak';

    // Interval ladders
    const extendedLadders = [14, 30, 60, 90, 180, 365];

    switch (performanceRating) {
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
        pattern.independentSolvedCount += 1;
        break;
      case 'Consistently strong':
        newConfidence = 'Strong';
        pattern.independentSolvedCount += 1;
        const currentIdx = extendedLadders.indexOf(pattern.revisionIntervalDays);
        if (currentIdx !== -1 && currentIdx < extendedLadders.length - 1) {
          nextIntervalDays = extendedLadders[currentIdx + 1];
        } else if (currentIdx === -1 && pattern.revisionIntervalDays >= 7) {
          nextIntervalDays = 14;
        } else {
          nextIntervalDays = 30;
        }
        break;
      default:
        nextIntervalDays = 3;
        newConfidence = 'Medium';
    }

    const now = new Date();
    const nextRevisionDate = new Date(now.getTime() + nextIntervalDays * 86400000);

    pattern.confidence = newConfidence;
    pattern.lastRevised = now;
    pattern.nextRevision = nextRevisionDate;
    pattern.revisionIntervalDays = nextIntervalDays;
    pattern.revisionCount += 1;
    if (notes) pattern.notes = notes;

    await pattern.save();

    // Log revision session
    const session = new RevisionSession({
      patternId: pattern._id.toString(),
      patternName: pattern.name,
      topic: pattern.topic,
      performanceRating,
      newConfidence,
      intervalDays: nextIntervalDays,
      nextRevisionScheduled: nextRevisionDate,
      sessionMinutes: sessionMinutes || 60,
      routineCompleted: !!routineCompleted,
      notes: notes || '',
    });
    await session.save();

    res.json({
      pattern,
      session,
      message: `Pattern revised! Next revision scheduled in ${nextIntervalDays} day${nextIntervalDays > 1 ? 's' : ''}.`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
