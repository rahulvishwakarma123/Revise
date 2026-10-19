import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import patternRoutes from './routes/patternRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import mistakeRoutes from './routes/mistakeRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request Logger in dev
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// API Routes
app.use('/api/patterns', patternRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DSA Revision Tracker API'
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] DSA Revision Tracker backend running on http://localhost:${PORT}`);
  });
};

startServer();
