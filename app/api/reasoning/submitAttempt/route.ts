import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { RE_QUESTIONS } from '@/lib/reasoning-data'
import { connectDB } from '@/lib/db'
import PracticeAttempt from '@/models/practiceAttempt'

function normalizeTopic(topic?: string) {
  if (!topic) return ''
  return topic.replace(/\s+/g, '').toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload?.id) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const topicKey = normalizeTopic(body.topic)
    const pool = RE_QUESTIONS[topicKey]
    if (!pool) return NextResponse.json({ ok: false, message: 'Unsupported topic' }, { status: 400 })

    const answers = Array.isArray(body.answers) ? body.answers : []
    const details = answers.map((a: any) => {
      const ref = pool.find((q) => q.question.trim() === String(a.question || '').trim())
      const correct = ref?.answer
      const wasCorrect = Boolean(correct && a.selected && a.selected === correct)
      return {
        question: a.question,
        selected: a.selected,
        correctAnswer: correct || '',
        wasCorrect,
        timeTaken: Number(a.timeTaken || 0),
        topic: topicKey,
      }
    })

    const score = details.filter((d: any) => d.wasCorrect).length
    const total = details.length

    const created = await PracticeAttempt.create({
      userId: String(payload.id),
      domain: 'reasoning',
      topic: topicKey,
      questions: details,
      totalTime: Number(body.totalTime || 0),
      score,
      total,
    })

    return NextResponse.json({ ok: true, id: String(created._id), score, total }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to submit attempt' }, { status: 500 })
  }
}
