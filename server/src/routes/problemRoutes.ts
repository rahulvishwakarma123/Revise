import { Router, Request, Response } from 'express';
import { Problem } from '../models/Problem.js';
import { Pattern } from '../models/Pattern.js';

const router = Router();

// GET all problems with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, status, patternName, search } = req.query;
    const filter: any = {};

    if (topic && topic !== 'All') filter.topic = topic;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (status && status !== 'All') filter.status = status;
    if (patternName && patternName !== 'All') filter.patternName = patternName;
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { title: searchRegex },
        { topic: searchRegex },
        { patternName: searchRegex },
        { keyNotes: searchRegex }
      ];
    }

    const problems = await Problem.find(filter).sort({ solvedAt: -1, createdAt: -1 });
    res.json(problems);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new problem
router.post('/', async (req: Request, res: Response) => {
  try {
    const problem = new Problem(req.body);
    await problem.save();

    // Increment problem count in pattern if matched
    if (problem.patternName) {
      await Pattern.findOneAndUpdate(
        { name: problem.patternName },
        { 
          $inc: { 
            totalProblemsCount: 1,
            independentSolvedCount: problem.status === 'Solved Independently' ? 1 : 0
          } 
        }
      );
    }

    res.status(201).json(problem);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update problem
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE problem
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    
    // Decrement pattern counter if exists
    if (problem.patternName) {
      await Pattern.findOneAndUpdate(
        { name: problem.patternName },
        { 
          $inc: { 
            totalProblemsCount: -1,
            independentSolvedCount: problem.status === 'Solved Independently' ? -1 : 0
          } 
        }
      );
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
