import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { loadAllAttempts, computeWeakTopics } from '@/lib/ml'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const history = await loadAllAttempts(String(payload.id))
    const weak = computeWeakTopics({ practices: history.practices || [], quizzes: history.quizzes || [], aptitudes: history.aptitudes || [] })

    // Build a simple recommended learning path from weakest topics
    const top = weak.slice(0, 6)
    const steps = top.map((w, i) => ({
      id: `step-${i + 1}`,
      title: `${(w.domain || 'general').toUpperCase()} · ${w.topic}`,
      description: `Improve ${w.topic} (${w.domain}). Current accuracy ${w.accuracy}%. Practice targeted sets and review explanations.`,
      status: i === 0 ? 'in-progress' : 'locked',
      estimatedDays: Math.max(2, Math.ceil((100 - Math.min(99, w.accuracy)) / 15)),
      resources: ['Practice Problems', 'Explanations Review', 'Recommended Videos'],
      contentId: `${w.domain || 'general'}-${w.topic}`.toLowerCase().replace(/\s+/g, '-'),
      difficulty: w.accuracy < 50 ? 'beginner' : w.accuracy < 75 ? 'intermediate' : 'advanced',
    }))

    const path = {
      id: 'rec-1',
      name: 'Personalized Improvement Plan',
      goal: 'Target weakest topics first to lift overall score',
      totalSteps: steps.length,
      completedSteps: 0,
      estimatedDuration: steps.reduce((a, s) => a + s.estimatedDays, 0),
      steps,
      createdAt: new Date(),
      targetCompletionDate: new Date(Date.now() + steps.reduce((a, s) => a + s.estimatedDays, 0) * 24 * 60 * 60 * 1000),
    }

    return NextResponse.json({ ok: true, path })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to build recommendations' }, { status: 500 })
  }
}
