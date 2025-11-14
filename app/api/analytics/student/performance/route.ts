import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { loadAllAttempts, buildTimeline, linearRegression, passFailProbability, computeWeakTopics, buildAnalysisPayload } from '@/lib/ml'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const userId = String(payload.id)
    const history = await loadAllAttempts(userId)

    const timeline = buildTimeline(history.exams || [])
    const series = timeline.map((p, i) => ({ t: i + 1, score: p.score }))
    const lr = linearRegression(series)
    const predictedNext = lr.predict(series.length + 1)
    const currentScore = series.length ? series[series.length - 1].score : 0
    const passProb = passFailProbability(currentScore, lr.a)

    const weakTopics = computeWeakTopics({ practices: history.practices || [], quizzes: history.quizzes || [], aptitudes: history.aptitudes || [] })
    const analysis = buildAnalysisPayload(series, weakTopics, predictedNext, passProb)

    return NextResponse.json({
      ok: true,
      trend: { slope: lr.a, intercept: lr.b, points: series },
      predictedScore: analysis.predictedScore,
      passProbability: analysis.passProbability,
      weakTopics: analysis.weakTopics,
      categoryScores: analysis.categoryScores,
      radarData: analysis.radarData,
    })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to compute performance' }, { status: 500 })
  }
}
