// TypeScript types for the application

export interface User {
  _id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: "student" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface StudentProfile {
  _id: string
  userId: string
  academicBackground: string
  targetExams: string[]
  strengths: string[]
  weaknesses: string[]
  completedAt: Date
}

export interface Exam {
  _id: string
  title: string
  description: string
  duration: number // in minutes
  totalQuestions: number
  categories: string[]
  createdBy: string
  createdAt: Date
}

export interface Question {
  _id: string
  examId: string
  category: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ExamResponse {
  _id: string
  studentId: string
  examId: string
  answers: {
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
  }[]
  score: number
  completedAt: Date
}

export interface Report {
  _id: string
  studentId: string
  examId: string
  examResponseId: string
  overallScore: number
  categoryScores: {
    category: string
    score: number
    percentage: number
  }[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  generatedAt: Date
}
