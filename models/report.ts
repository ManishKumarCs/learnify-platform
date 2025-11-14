import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface ICategoryScore {
  name: string
  score: number
}

export interface IReport extends Document {
  studentId: mongoose.Types.ObjectId | string
  assignmentId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  category?: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  analysis?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const CategoryScoreSchema = new Schema<ICategoryScore>({
  name: { type: String, required: true },
  score: { type: Number, required: true },
}, { _id: false })

const ReportSchema = new Schema<IReport>({
  studentId: { type: Schema.Types.Mixed, required: true, index: true },
  assignmentId: { type: String, required: true, index: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  category: { type: String },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
  analysis: { type: Schema.Types.Mixed },
}, { timestamps: true })

export default (models.Report as mongoose.Model<IReport>) || model<IReport>('Report', ReportSchema)
