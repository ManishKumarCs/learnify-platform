import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IQuestion extends Document {
  title: string
  description?: string
  options: string[]
  correctAnswer: number
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    description: { type: String },
    options: { type: [String], required: true, validate: (v: string[]) => v.length >= 2 },
    correctAnswer: { type: Number, required: true, min: 0 },
    category: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export default (models.Question as mongoose.Model<IQuestion>) || model<IQuestion>('Question', QuestionSchema)
