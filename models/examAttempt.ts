import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IExamAnswer {
  questionText: string
  options?: string[]
  explanation?: string
  selectedIndex: number | null
  correctIndex?: number
  timeTaken?: number
}

export interface IExamAttempt extends Document {
  assignmentId: string
  userId: mongoose.Types.ObjectId | string
  domain?: string
  topic?: string
  answers: IExamAnswer[]
  score: number
  totalQuestions: number
  violations: number
  startedAt?: Date
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ExamAnswerSchema = new Schema<IExamAnswer>({
  questionText: { type: String, required: true },
  options: { type: [String], default: [] },
  explanation: { type: String },
  selectedIndex: { type: Number },
  correctIndex: { type: Number },
  timeTaken: { type: Number },
}, { _id: false })

const ExamAttemptSchema = new Schema<IExamAttempt>({
  assignmentId: { type: String, required: true, index: true },
  userId: { type: Schema.Types.Mixed, required: true, index: true },
  domain: { type: String },
  topic: { type: String },
  answers: { type: [ExamAnswerSchema], default: [] },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  violations: { type: Number, default: 0 },
  startedAt: { type: Date },
  submittedAt: { type: Date, required: true },
}, { timestamps: true })

export default (models.ExamAttempt as mongoose.Model<IExamAttempt>) || model<IExamAttempt>('ExamAttempt', ExamAttemptSchema)
