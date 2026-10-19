import mongoose, { Document, Schema } from 'mongoose';

export interface IMistake extends Document {
  problemTitle: string;
  problemUrl?: string;
  topic: string;
  patternName: string;
  category: 
    | 'Wrong boundary' 
    | 'Wrong pattern' 
    | 'Implementation bug' 
    | 'Off-by-one' 
    | 'Missed constraint' 
    | 'Integer overflow' 
    | 'TLE / Suboptimal' 
    | 'Other';
  mistakeDescription: string;
  lessonLearned: string;
  createdAt: Date;
  updatedAt: Date;
}

const MistakeSchema = new Schema<IMistake>({
  problemTitle: { type: String, required: true, trim: true },
  problemUrl: { type: String, default: '' },
  topic: { type: String, required: true, index: true },
  patternName: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: [
      'Wrong boundary', 
      'Wrong pattern', 
      'Implementation bug', 
      'Off-by-one', 
      'Missed constraint', 
      'Integer overflow', 
      'TLE / Suboptimal', 
      'Other'
    ], 
    default: 'Wrong boundary',
    index: true
  },
  mistakeDescription: { type: String, required: true },
  lessonLearned: { type: String, required: true },
}, {
  timestamps: true,
});

export const Mistake = mongoose.model<IMistake>('Mistake', MistakeSchema);
