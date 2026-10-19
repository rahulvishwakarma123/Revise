import mongoose, { Document, Schema } from 'mongoose';

export interface ICanonicalProblem {
  title: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform?: string;
}

export interface IPattern extends Document {
  name: string;
  topic: string;
  subtopic?: string;
  confidence: 'Weak' | 'Medium' | 'Strong';
  intuition: string;
  recognitionSignals: string[];
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string[];
  canonicalProblems: ICanonicalProblem[];
  lastRevised: Date | null;
  nextRevision: Date | null;
  revisionIntervalDays: number;
  revisionCount: number;
  independentSolvedCount: number;
  totalProblemsCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CanonicalProblemSchema = new Schema<ICanonicalProblem>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  platform: { type: String, default: 'LeetCode' },
}, { _id: false });

const PatternSchema = new Schema<IPattern>({
  name: { type: String, required: true, unique: true, trim: true },
  topic: { type: String, required: true, index: true },
  subtopic: { type: String, default: '' },
  confidence: { type: String, enum: ['Weak', 'Medium', 'Strong'], default: 'Weak', index: true },
  intuition: { type: String, required: true },
  recognitionSignals: { type: [String], default: [] },
  timeComplexity: { type: String, default: 'O(N)' },
  spaceComplexity: { type: String, default: 'O(1)' },
  edgeCases: { type: [String], default: [] },
  canonicalProblems: { type: [CanonicalProblemSchema], default: [] },
  lastRevised: { type: Date, default: null },
  nextRevision: { type: Date, default: null, index: true },
  revisionIntervalDays: { type: Number, default: 1 },
  revisionCount: { type: Number, default: 0 },
  independentSolvedCount: { type: Number, default: 0 },
  totalProblemsCount: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

export const Pattern = mongoose.model<IPattern>('Pattern', PatternSchema);
