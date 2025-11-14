import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export type GetQuestionsQuery = {
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  limit?: string | number
}

// Map internal topics to QuizAPI tags
const TOPIC_TAG_MAP: Record<string, string> = {
  'cs concepts': 'code',
  'aptitude': 'math',
  'reasoning': 'logic',
  'programming': 'code',
  'data structures': 'data-structures',
}

function normalizeTopic(topic?: string) {
  if (!topic) return undefined
  const key = topic.trim().toLowerCase()
  return TOPIC_TAG_MAP[key] || key
}

function normalizeDifficulty(d?: string) {
  if (!d) return undefined
  const v = d.toLowerCase()
  if (v === 'easy') return 'Easy'
  if (v === 'medium') return 'Medium'
  if (v === 'hard') return 'Hard'
  return undefined
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query: GetQuestionsQuery = {
      topic: searchParams.get('topic') || undefined,
      difficulty: (searchParams.get('difficulty') as any) || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const apiKey = process.env.QUIZAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ message: 'QUIZAPI_KEY is not configured' }, { status: 500 })
    }

    const params: Record<string, any> = {}
    const tag = normalizeTopic(query.topic)
    if (tag) params.tags = tag

    const diff = normalizeDifficulty(query.difficulty)
    if (diff) params.difficulty = diff

    const limit = query.limit ? Number(query.limit) : undefined
    if (limit && !Number.isNaN(limit)) params.limit = Math.min(Math.max(limit, 1), 50)

    const { data } = await axios.get('https://quizapi.io/api/v1/questions', {
      headers: { 'X-Api-Key': apiKey },
      params,
    })

    return NextResponse.json({
      ok: true,
      count: Array.isArray(data) ? data.length : 0,
      questions: data,
    })
  } catch (err: any) {
    // Axios error handling
    const status = err.response?.status || 500
    const msg = err.response?.data || err.message || 'Failed to fetch questions'
    return NextResponse.json({ ok: false, message: msg }, { status })
  }
}
