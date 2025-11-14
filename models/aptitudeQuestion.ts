import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IAptitudeQuestion extends Document {
  topic: string // e.g., 'age', 'mixtureandalligation'
  question: string
  answer: string
  options: string[]
  explanation?: string
  createdAt: Date
  updatedAt: Date
}

const AptitudeQuestionSchema = new Schema<IAptitudeQuestion>({
  topic: { type: String, required: true, index: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  options: { type: [String], required: true, validate: (v: string[]) => v.length >= 2 },
  explanation: { type: String },
}, { timestamps: true })

AptitudeQuestionSchema.index({ topic: 1, question: 1 }, { unique: true })

export default (models.AptitudeQuestion as mongoose.Model<IAptitudeQuestion>) || model<IAptitudeQuestion>('AptitudeQuestion', AptitudeQuestionSchema)
