import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IQuestionAttempt {
  questionId: string
  wasCorrect: boolean
  timeTaken: number
}

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId | string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: IQuestionAttempt[]
  totalTime: number
  createdAt: Date
  updatedAt: Date
}

const QuestionAttemptSchema = new Schema<IQuestionAttempt>({
  questionId: { type: String, required: true },
  wasCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
},{ _id: false })

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  userId: { type: Schema.Types.Mixed, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy','medium','hard'], required: true },
  questions: { type: [QuestionAttemptSchema], default: [] },
  totalTime: { type: Number, required: true },
}, { timestamps: true })

export default (models.QuizAttempt as mongoose.Model<IQuizAttempt>) || model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema)
