import { NextRequest, NextResponse } from 'next/server'
import { APT_QUESTIONS } from '@/lib/aptitude-data'

function normalizeTopic(topic?: string) {
  if (!topic) return 'random'
  return topic.replace(/\s+/g, '').toLowerCase()
}

export type AptitudeGetQuestionsQuery = {
  topic?: string
  limit?: string | number
}

export type AptitudeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
}

export type AptitudeGetQuestionsResponse = {
  ok: boolean
  topic: string
  count?: number
  questions?: AptitudeQuestion[]
  message?: string
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const topicParam = searchParams.get('topic') || undefined
    const key = normalizeTopic(topicParam)
    const limitParam = searchParams.get('limit')
    const limit = Math.max(1, Math.min(Number(limitParam || 10), 50))

    // Build items from static dataset
    const allTopics = Object.keys(APT_QUESTIONS)
    let pool: AptitudeQuestion[] = []
    if (key === 'random') {
      for (const t of allTopics) pool = pool.concat(APT_QUESTIONS[t] || [])
    } else {
      if (!APT_QUESTIONS[key]) {
        return NextResponse.json<AptitudeGetQuestionsResponse>({ ok: false, topic: key, message: 'Unsupported topic' }, { status: 400 })
      }
      pool = APT_QUESTIONS[key]
    }

    // Random sample up to limit
    const sampled = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

    return NextResponse.json<AptitudeGetQuestionsResponse>({ ok: true, topic: key, count: sampled.length, questions: sampled })
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch aptitude questions'
    return NextResponse.json<AptitudeGetQuestionsResponse>({ ok: false, topic: 'unknown', message: String(msg) }, { status: 500 })
  }
}
