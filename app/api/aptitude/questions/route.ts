import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AptitudeQuestion, { IAptitudeQuestion } from '@/models/aptitudeQuestion'
import { verifyToken } from '@/lib/auth'

function normalizeTopic(topic?: string) {
  if (!topic) return ''
  return topic.replace(/\s+/g, '').toLowerCase()
}

export type UpsertAptitudeQuestion = {
  topic: string
  question: string
  answer: string
  options: string[]
  explanation?: string
}

export type UpsertAptitudeQuestionsBody = UpsertAptitudeQuestion | UpsertAptitudeQuestion[]

export type UpsertAptitudeQuestionsResponse = {
  ok: boolean
  inserted?: number
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Optional: require admin auth
    const token = req.cookies.get('token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json<UpsertAptitudeQuestionsResponse>({ ok: false, message: 'Forbidden' }, { status: 403 })
      }
    } else {
      // If you want to allow without auth for initial seeding, comment these two lines
      return NextResponse.json<UpsertAptitudeQuestionsResponse>({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as UpsertAptitudeQuestionsBody
    const input = Array.isArray(body) ? body : [body]

    if (input.length === 0) {
      return NextResponse.json<UpsertAptitudeQuestionsResponse>({ ok: false, message: 'Empty payload' }, { status: 400 })
    }

    const docs = input.map((q) => ({
      topic: normalizeTopic(q.topic),
      question: q.question,
      answer: q.answer,
      options: q.options,
      explanation: q.explanation,
    }))

    for (const d of docs) {
      if (!d.topic || !d.question || !d.answer || !Array.isArray(d.options) || d.options.length < 2) {
        return NextResponse.json<UpsertAptitudeQuestionsResponse>({ ok: false, message: 'Invalid question payload' }, { status: 400 })
      }
    }

    const result = await AptitudeQuestion.insertMany(docs, { ordered: false })
    return NextResponse.json<UpsertAptitudeQuestionsResponse>({ ok: true, inserted: result.length }, { status: 201 })
  } catch (err: any) {
    const msg = err?.message || 'Failed to insert questions'
    return NextResponse.json<UpsertAptitudeQuestionsResponse>({ ok: false, message: msg }, { status: 500 })
  }
}
