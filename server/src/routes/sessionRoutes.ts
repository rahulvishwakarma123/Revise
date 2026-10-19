import { Router, Request, Response } from 'express';
import { RevisionSession } from '../models/RevisionSession.js';

const router = Router();

// GET all revision sessions
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sessions = await RevisionSession.find().sort({ createdAt: -1 }).limit(50);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST log routine session
router.post('/', async (req: Request, res: Response) => {
  try {
    const session = new RevisionSession(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
