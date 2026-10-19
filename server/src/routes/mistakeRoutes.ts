import { Router, Request, Response } from 'express';
import { Mistake } from '../models/Mistake.js';

const router = Router();

// GET all mistakes with optional category/topic/search filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, topic, patternName, search } = req.query;
    const filter: any = {};

    if (category && category !== 'All') filter.category = category;
    if (topic && topic !== 'All') filter.topic = topic;
    if (patternName && patternName !== 'All') filter.patternName = patternName;
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { problemTitle: searchRegex },
        { mistakeDescription: searchRegex },
        { lessonLearned: searchRegex },
        { topic: searchRegex },
        { patternName: searchRegex }
      ];
    }

    const mistakes = await Mistake.find(filter).sort({ createdAt: -1 });
    res.json(mistakes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create mistake entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const mistake = new Mistake(req.body);
    await mistake.save();
    res.status(201).json(mistake);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update mistake entry
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const mistake = await Mistake.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mistake) return res.status(404).json({ error: 'Mistake not found' });
    res.json(mistake);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE mistake entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const mistake = await Mistake.findByIdAndDelete(req.params.id);
    if (!mistake) return res.status(404).json({ error: 'Mistake not found' });
    res.json({ message: 'Mistake log removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
