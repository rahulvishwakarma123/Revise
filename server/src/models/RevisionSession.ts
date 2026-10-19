import mongoose, { Document, Schema } from 'mongoose';

export interface IRevisionSession extends Document {
  patternId?: string;
  patternName: string;
  topic: string;
  performanceRating: 
    | 'Could not solve independently' 
    | 'Solved with a hint' 
    | 'Solved independently' 
    | 'Consistently strong';
  newConfidence: 'Weak' | 'Medium' | 'Strong';
  intervalDays: number;
  nextRevisionScheduled: Date;
  sessionMinutes: number;
  routineCompleted: boolean;
  notes?: string;
  createdAt: Date;
}

const RevisionSessionSchema = new Schema<IRevisionSession>({
  patternId: { type: String, default: '' },
  patternName: { type: String, required: true },
  topic: { type: String, required: true },
  performanceRating: { 
    type: String, 
    enum: [
      'Could not solve independently', 
      'Solved with a hint', 
      'Solved independently', 
      'Consistently strong'
    ], 
    required: true 
  },
  newConfidence: { 
    type: String, 
    enum: ['Weak', 'Medium', 'Strong'], 
    required: true 
  },
  intervalDays: { type: Number, required: true },
  nextRevisionScheduled: { type: Date, required: true },
  sessionMinutes: { type: Number, default: 60 },
  routineCompleted: { type: Boolean, default: false },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

export const RevisionSession = mongoose.model<IRevisionSession>('RevisionSession', RevisionSessionSchema);
