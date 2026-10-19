import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../config/db.js';
import { Pattern } from '../models/Pattern.js';
import { Problem } from '../models/Problem.js';
import { Mistake } from '../models/Mistake.js';
import { RevisionSession } from '../models/RevisionSession.js';
import { initialSeedPatterns } from './seedPatterns.js';
import { initialSeedProblems } from './seedProblems.js';
import { initialSeedMistakes } from './seedMistakes.js';
import mongoose from 'mongoose';

const seedDatabase = async () => {
  console.log('[Seed] Starting database seed...');
  const connected = await connectDB();
  if (!connected) {
    console.error('[Seed] Could not connect to MongoDB. Exiting seeder.');
    process.exit(1);
  }

  try {
    await Pattern.deleteMany({});
    await Problem.deleteMany({});
    await Mistake.deleteMany({});
    await RevisionSession.deleteMany({});

    console.log('[Seed] Cleared existing collections.');

    const insertedPatterns = await Pattern.insertMany(initialSeedPatterns);
    console.log(`[Seed] Inserted ${insertedPatterns.length} DSA patterns.`);

    const insertedProblems = await Problem.insertMany(initialSeedProblems);
    console.log(`[Seed] Inserted ${insertedProblems.length} sample problems.`);

    const insertedMistakes = await Mistake.insertMany(initialSeedMistakes);
    console.log(`[Seed] Inserted ${insertedMistakes.length} mistake log entries.`);

    // Sample revision session
    await RevisionSession.create({
      patternName: 'Converging Two Pointers',
      topic: 'Arrays',
      performanceRating: 'Solved independently',
      newConfidence: 'Strong',
      intervalDays: 14,
      nextRevisionScheduled: new Date(Date.now() + 14 * 86400000),
      sessionMinutes: 60,
      routineCompleted: true,
      notes: '60-min routine completed: solved 3Sum and Container With Most Water cleanly.'
    });

    console.log('[Seed] Successfully completed database seeding!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
