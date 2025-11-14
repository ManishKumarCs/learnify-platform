import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { APT_QUESTIONS } from '@/lib/aptitude-data'
import { connectDB } from '@/lib/db'
import AptitudeAttempt, { IAptitudeAttempt } from '@/models/aptitudeAttempt'

export type AptitudeSubmitItem = {
  question: string
  selected?: string
  timeTaken?: number
}

export type AptitudeSubmitBody = {
  topic: string
  totalTime?: number
  answers: AptitudeSubmitItem[]
}

export type AptitudeSubmitResponse = {
  ok: boolean
  id?: string
  score?: number
  total?: number
  message?: string
}

function normalizeTopic(topic?: string) {
  if (!topic) return ''
  return topic.replace(/\s+/g, '').toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json<AptitudeSubmitResponse>({ ok: false, message: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload?.id) return NextResponse.json<AptitudeSubmitResponse>({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const body = (await req.json()) as AptitudeSubmitBody
    const topicKey = normalizeTopic(body.topic)
    const pool = APT_QUESTIONS[topicKey]
    if (!pool) return NextResponse.json<AptitudeSubmitResponse>({ ok: false, message: 'Unsupported topic' }, { status: 400 })

    const total = Array.isArray(body.answers) ? body.answers.length : 0
    if (total === 0) return NextResponse.json<AptitudeSubmitResponse>({ ok: false, message: 'No answers' }, { status: 400 })

    // Grade: match by exact question text within selected topic
    const details = body.answers.map((a) => {
      const ref = pool.find((q) => q.question.trim() === (a.question || '').trim())
      const correct = ref?.answer
      const wasCorrect = Boolean(correct && a.selected && a.selected === correct)
      return {
        question: a.question,
        selected: a.selected,
        correctAnswer: correct || '',
        wasCorrect,
        timeTaken: a.timeTaken || 0,
        topic: topicKey,
      }
    })

    const score = details.filter((d) => d.wasCorrect).length

    const created = await AptitudeAttempt.create({
      userId: String(payload.id),
      topic: topicKey,
      questions: details,
      totalTime: body.totalTime || 0,
      score,
      total,
    } as Partial<IAptitudeAttempt>)

    return NextResponse.json<AptitudeSubmitResponse>({ ok: true, id: String(created._id), score, total }, { status: 201 })
  } catch (err: any) {
    const msg = err?.message || 'Failed to submit attempt'
    return NextResponse.json<AptitudeSubmitResponse>({ ok: false, message: msg }, { status: 500 })
  }
}
