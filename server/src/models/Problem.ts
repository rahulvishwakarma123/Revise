import mongoose, { Document, Schema } from 'mongoose';

export interface IRecognitionScore {
  identifiedPattern: boolean;
  derivedBruteForce: boolean;
  couldOptimize: boolean;
  implementedWithoutHelp: boolean;
}

export interface IProblem extends Document {
  title: string;
  url: string;
  platform: 'LeetCode' | 'Codeforces' | 'GeeksforGeeks' | 'Other';
  topic: string;
  patternName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved Independently' | 'Solved with Hints' | 'Unsolved';
  solvedWithoutAI: boolean;
  timeTakenMinutes: number;
  attempts: number;
  recognitionScore: IRecognitionScore;
  keyNotes: string;
  solvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecognitionScoreSchema = new Schema<IRecognitionScore>({
  identifiedPattern: { type: Boolean, default: false },
  derivedBruteForce: { type: Boolean, default: false },
  couldOptimize: { type: Boolean, default: false },
  implementedWithoutHelp: { type: Boolean, default: false },
}, { _id: false });

const ProblemSchema = new Schema<IProblem>({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  platform: { 
    type: String, 
    enum: ['LeetCode', 'Codeforces', 'GeeksforGeeks', 'Other'], 
    default: 'LeetCode' 
  },
  topic: { type: String, required: true, index: true },
  patternName: { type: String, required: true, index: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Solved Independently', 'Solved with Hints', 'Unsolved'], 
    default: 'Solved Independently',
    index: true 
  },
  solvedWithoutAI: { type: Boolean, default: true },
  timeTakenMinutes: { type: Number, default: 20 },
  attempts: { type: Number, default: 1 },
  recognitionScore: { 
    type: RecognitionScoreSchema, 
    default: () => ({
      identifiedPattern: true,
      derivedBruteForce: true,
      couldOptimize: true,
      implementedWithoutHelp: true,
    }) 
  },
  keyNotes: { type: String, default: '' },
  solvedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
