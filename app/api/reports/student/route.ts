import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import QuizAttempt from '@/models/quizAttempt'
import AptitudeAttempt from '@/models/aptitudeAttempt'
import PracticeAttempt from '@/models/practiceAttempt'

export type TopicStat = {
  topic: string
  attempts: number
  correct: number
  total: number
  accuracy: number
}

export type RecentAttempt = {
  id: string
  kind: 'quiz' | 'aptitude' | 'reasoning' | 'cs' | 'dsa'
  topic: string
  score: number
  total: number
  date: string
}

export type StudentReportResponse = {
  ok: boolean
  summary?: {
    totalAttempts: number
    averageAccuracy: number
    topics: TopicStat[]
  }
  recent?: RecentAttempt[]
  ml?: {
    overallProficiency: number
    topics: Array<{
      topic: string
      rating: number
      proficiency: number
      attempts: number
      accuracy: number
    }>
    recommendations: Array<{
      topic: string
      reason: string
    }>
  }
  message?: string
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json<StudentReportResponse>({ ok: false, message: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload?.id) return NextResponse.json<StudentReportResponse>({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const userId = String(payload.id)

    const [quiz, apt, practice] = await Promise.all([
      QuizAttempt.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
      AptitudeAttempt.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
      PracticeAttempt.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    ])

    // Normalize to common representation
    const recent: RecentAttempt[] = []
    const topicMap: Record<string, { attempts: number; correct: number; total: number }> = {}
    type Event = { topic: string; correct: boolean; ts: number; difficulty?: 'easy'|'medium'|'hard' }
    const events: Event[] = []

    for (const a of apt) {
      const score = Number(a.score || 0)
      const total = Number(a.total || (a.questions?.length || 0))
      const topic = String(a.topic || 'unknown')
      recent.push({ id: String(a._id), kind: 'aptitude', topic, score, total, date: a.createdAt?.toISOString?.() || '' })
      if (!topicMap[topic]) topicMap[topic] = { attempts: 0, correct: 0, total: 0 }
      topicMap[topic].attempts += 1
      topicMap[topic].correct += score
      topicMap[topic].total += total
      // Per-question events (assume medium difficulty if not provided)
      for (const qa of (a as any).questions || []) {
        events.push({ topic, correct: Boolean(qa.wasCorrect), ts: new Date((a as any).createdAt || Date.now()).getTime(), difficulty: 'medium' })
      }
    }

    for (const p of practice) {
      const score = Number((p as any).score || 0)
      const total = Number((p as any).total || ((p as any).questions?.length || 0))
      const topic = String((p as any).topic || 'unknown')
      const kind = String((p as any).domain || 'practice') as 'reasoning' | 'cs' | 'dsa'
      recent.push({ id: String((p as any)._id), kind, topic, score, total, date: (p as any).createdAt?.toISOString?.() || '' })
      if (!topicMap[topic]) topicMap[topic] = { attempts: 0, correct: 0, total: 0 }
      topicMap[topic].attempts += 1
      topicMap[topic].correct += score
      topicMap[topic].total += total
    }

    for (const q of quiz) {
      // compute score from questions
      const corr = (q as any).questions?.filter((x: any) => x.wasCorrect)?.length || 0
      const tot = (q as any).questions?.length || 0
      const topic = String((q as any).topic || 'quiz')
      recent.push({ id: String(q._id), kind: 'quiz', topic, score: corr, total: tot, date: (q as any).createdAt?.toISOString?.() || '' })
      if (!topicMap[topic]) topicMap[topic] = { attempts: 0, correct: 0, total: 0 }
      topicMap[topic].attempts += 1
      topicMap[topic].correct += corr
      topicMap[topic].total += tot
      for (const qa of (q as any).questions || []) {
        events.push({ topic, correct: Boolean(qa.wasCorrect), ts: new Date((q as any).createdAt || Date.now()).getTime(), difficulty: (qa as any).difficulty || 'medium' })
      }
    }

    recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const topics: TopicStat[] = Object.entries(topicMap).map(([topic, v]) => ({
      topic,
      attempts: v.attempts,
      correct: v.correct,
      total: v.total,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))

    const totalAttempts = recent.length
    const averageAccuracy = topics.length
      ? Math.round(
          topics.reduce((acc, t) => acc + (t.total > 0 ? t.correct / t.total : 0), 0) / topics.length * 100,
        )
      : 0

    // ML-style proficiency (ELO-like per topic)
    const topicRatings: Record<string, { r: number; attempts: number; correct: number; total: number }> = {}
    const base = 1500
    const kBase = 16
    const diffAdj = { easy: -100, medium: 0, hard: 100 } as const
    events.sort((a, b) => a.ts - b.ts)
    for (const ev of events) {
      if (!topicRatings[ev.topic]) topicRatings[ev.topic] = { r: base, attempts: 0, correct: 0, total: 0 }
      const t = topicRatings[ev.topic]
      const opp = base + diffAdj[ev.difficulty || 'medium']
      const expected = 1 / (1 + Math.pow(10, (opp - t.r) / 400))
      const score = ev.correct ? 1 : 0
      // Slightly higher K for early attempts, lower later
      const k = kBase * (t.attempts < 20 ? 1.5 : 1.0)
      t.r = t.r + k * (score - expected)
      t.attempts += 1
      t.total += 1
      if (ev.correct) t.correct += 1
    }

    const mlTopics = Object.keys({ ...topicMap }).map((topic) => {
      const t = topicRatings[topic] || { r: base, attempts: 0, correct: 0, total: 0 }
      // Map rating (1000..2000) to 0..100
      const prof = Math.max(0, Math.min(100, Math.round(((t.r - 1000) / 1000) * 100)))
      const acc = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
      return { topic, rating: Math.round(t.r), proficiency: prof, attempts: t.attempts, accuracy: acc }
    })

    const overallProficiency = mlTopics.length
      ? Math.round(mlTopics.reduce((a, b) => a + b.proficiency, 0) / mlTopics.length)
      : 0

    const recommendations = mlTopics
      .filter((t) => (t.attempts >= 5 && t.proficiency < 60) || (t.attempts < 5))
      .sort((a, b) => a.proficiency - b.proficiency)
      .slice(0, 5)
      .map((t) => ({ topic: t.topic, reason: t.attempts < 5 ? 'Low practice volume' : 'Low proficiency' }))

    return NextResponse.json<StudentReportResponse>({
      ok: true,
      summary: { totalAttempts, averageAccuracy, topics },
      recent: recent.slice(0, 10),
      ml: {
        overallProficiency,
        topics: mlTopics,
        recommendations,
      },
    })
  } catch (err: any) {
    const msg = err?.message || 'Failed to generate report'
    return NextResponse.json<StudentReportResponse>({ ok: false, message: msg }, { status: 500 })
  }
}
