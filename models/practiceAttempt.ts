import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IPracticeQuestionAttempt {
  question: string
  selected?: string
  correctAnswer: string
  wasCorrect: boolean
  timeTaken?: number
  topic: string
}

export interface IPracticeAttempt extends Document {
  userId: mongoose.Types.ObjectId | string
  domain: 'reasoning' | 'cs' | 'dsa'
  topic: string
  questions: IPracticeQuestionAttempt[]
  totalTime?: number
  score: number
  total: number
  createdAt: Date
  updatedAt: Date
}

const PracticeQuestionAttemptSchema = new Schema<IPracticeQuestionAttempt>({
  question: { type: String, required: true },
  selected: { type: String },
  correctAnswer: { type: String, required: true },
  wasCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number },
  topic: { type: String, required: true, index: true },
}, { _id: false })

const PracticeAttemptSchema = new Schema<IPracticeAttempt>({
  userId: { type: Schema.Types.Mixed, required: true, index: true },
  domain: { type: String, enum: ['reasoning','cs','dsa'], required: true, index: true },
  topic: { type: String, required: true, index: true },
  questions: { type: [PracticeQuestionAttemptSchema], default: [] },
  totalTime: { type: Number },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
}, { timestamps: true })

export default (models.PracticeAttempt as mongoose.Model<IPracticeAttempt>) || model<IPracticeAttempt>('PracticeAttempt', PracticeAttemptSchema)
