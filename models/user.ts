import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'student' | 'admin'
  profile?: {
    academicBackground?: string
    targetExams?: string
    strengths?: string
    weaknesses?: string
    collegeName?: string
    universityRollNumber?: string
    section?: string
    classRollNumber?: string
    branch?: string
    course?: string
    leetcodeId?: string
    githubId?: string
    privacy?: {
      showEmail?: boolean
      showSocialIds?: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema(
  {
    academicBackground: { type: String },
    targetExams: { type: String },
    strengths: { type: String },
    weaknesses: { type: String },
    collegeName: { type: String },
    universityRollNumber: { type: String, match: /^[A-Za-z0-9\-_/]{4,20}$/ },
    section: { type: String },
    classRollNumber: { type: String, match: /^\d{1,4}$/ },
    branch: { type: String },
    course: { type: String },
    leetcodeId: { type: String },
    githubId: { type: String },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showSocialIds: { type: Boolean, default: false },
    },
  },
  { _id: false }
)

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profile: { type: ProfileSchema, default: {} },
  },
  { timestamps: true }
)

export default (models.User as mongoose.Model<IUser>) || model<IUser>('User', UserSchema)
