import { NextRequest, NextResponse } from 'next/server'
import { DSA_QUESTIONS } from '@/lib/dsa-data'

type PracticeQuestion = { question: string; answer: string; options: string[]; explanation?: string }

function normalizeTopic(topic?: string) {
  if (!topic) return 'random'
  return topic.replace(/\s+/g, '').toLowerCase()
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const topicParam = searchParams.get('topic') || undefined
    const key = normalizeTopic(topicParam)
    const limitParam = searchParams.get('limit')
    const limit = Math.max(1, Math.min(Number(limitParam || 10), 50))

    const allTopics = Object.keys(DSA_QUESTIONS)
    let pool: PracticeQuestion[] = []
    if (key === 'random') {
      for (const t of allTopics) pool = pool.concat(DSA_QUESTIONS[t] || [])
    } else {
      if (!DSA_QUESTIONS[key]) {
        return NextResponse.json({ ok: false, topic: key, message: 'Unsupported topic' }, { status: 400 })
      }
      pool = DSA_QUESTIONS[key]
    }

    const sampled = [...pool].sort(() => Math.random() - 0.5).slice(0, limit)
    return NextResponse.json({ ok: true, topic: key, count: sampled.length, questions: sampled })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to fetch questions' }, { status: 500 })
  }
}
