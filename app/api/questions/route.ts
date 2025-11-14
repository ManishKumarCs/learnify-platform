import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Question, { IQuestion } from '@/models/question'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  await connectDB()
  const items = await Question.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json(items.map((q: any) => ({
    id: String(q._id),
    title: q.title,
    description: q.description,
    options: q.options,
    correctAnswer: q.correctAnswer,
    category: q.category,
    difficulty: q.difficulty,
    createdAt: q.createdAt,
  })))
}

export async function POST(req: NextRequest) {
  await connectDB()
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const input = Array.isArray(body) ? body : [body]

  // Expect shape aligning with admin upload:
  // { text, options[], correctAnswer (number), category, difficulty ('Easy'|'Medium'|'Hard'), explanation, exam }
  const docs = input.map((q: any) => ({
    title: q.text || q.title,
    description: q.explanation || q.description,
    options: q.options || [],
    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
    category: q.category,
    difficulty: (q.difficulty || 'medium').toString().toLowerCase(),
    createdBy: payload.id,
  }))

  // Basic validation
  for (const d of docs) {
    if (!d.title || !Array.isArray(d.options) || d.options.length < 2) {
      return NextResponse.json({ message: 'Invalid question payload' }, { status: 400 })
    }
  }

  const created = await Question.insertMany(docs)
  return NextResponse.json({ inserted: created.length }, { status: 201 })
}
