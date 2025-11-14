import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IAssignment extends Document {
  title: string
  domain: 'aptitude' | 'reasoning' | 'cs' | 'dsa' | 'quiz'
  topic: string
  limit: number
  assignedTo: string[] // userIds as strings
  dueAt?: Date
  status: 'draft' | 'active' | 'closed'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  domain: { type: String, enum: ['aptitude','reasoning','cs','dsa','quiz'], required: true, index: true },
  topic: { type: String, required: true },
  limit: { type: Number, default: 10, min: 1, max: 100 },
  assignedTo: { type: [String], default: [], index: true },
  dueAt: { type: Date },
  status: { type: String, enum: ['draft','active','closed'], default: 'active', index: true },
  createdBy: { type: String, required: true, index: true },
}, { timestamps: true })

export default (models.Assignment as mongoose.Model<IAssignment>) || model<IAssignment>('Assignment', AssignmentSchema)
