import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IAptitudeQuestionAttempt {
  question: string
  selected?: string
  correctAnswer: string
  wasCorrect: boolean
  timeTaken?: number
  topic: string
}

export interface IAptitudeAttempt extends Document {
  userId: mongoose.Types.ObjectId | string
  topic: string
  questions: IAptitudeQuestionAttempt[]
  totalTime?: number
  score: number // number of correct answers
  total: number // total questions
  createdAt: Date
  updatedAt: Date
}

const AptitudeQuestionAttemptSchema = new Schema<IAptitudeQuestionAttempt>({
  question: { type: String, required: true },
  selected: { type: String },
  correctAnswer: { type: String, required: true },
  wasCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number },
  topic: { type: String, required: true, index: true },
}, { _id: false })

const AptitudeAttemptSchema = new Schema<IAptitudeAttempt>({
  userId: { type: Schema.Types.Mixed, required: true, index: true },
  topic: { type: String, required: true, index: true },
  questions: { type: [AptitudeQuestionAttemptSchema], default: [] },
  totalTime: { type: Number },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
}, { timestamps: true })

export default (models.AptitudeAttempt as mongoose.Model<IAptitudeAttempt>) || model<IAptitudeAttempt>('AptitudeAttempt', AptitudeAttemptSchema)
