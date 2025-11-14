import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import ExamAttempt from '@/models/examAttempt'
import Report from '@/models/report'
import { buildTimeline, buildAnalysisPayload, linearRegression, passFailProbability, loadAllAttempts, computeWeakTopics, aggregatePerSubtopic } from '@/lib/ml'
import Assignment from '@/models/assignment'

function baselineText(score: number) {
  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommendations: string[] = []
  if (score >= 85) {
    strengths.push('Excellent overall performance')
    strengths.push('Strong conceptual understanding')
    recommendations.push('Challenge yourself with advanced problems')
  } else if (score >= 70) {
    strengths.push('Good grasp of fundamentals')
    weaknesses.push('Some areas need reinforcement')
    recommendations.push('Focus on weak areas with targeted practice')
  } else {
    weaknesses.push('Needs significant improvement')
    weaknesses.push('Fundamentals require review')
    recommendations.push('Start with basic concepts and build up')
  }
  recommendations.push('Take regular practice tests')
  recommendations.push('Review incorrect answers thoroughly')
  return { strengths, weaknesses, recommendations, performanceLevel: score >= 85 ? 'Advanced' : score >= 70 ? 'Intermediate' : 'Beginner' }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { questions, answers, violations = 0, startedAt } = await req.json()
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    const totalQuestions = questions.length
    const correctAnswers = questions.reduce((acc: number, q: any, idx: number) => {
      const sel = answers[idx]
      if (typeof q.correctIndex === 'number' && typeof sel === 'number' && q.correctIndex === sel) return acc + 1
      return acc
    }, 0)
    const score = Math.round((correctAnswers / Math.max(1, totalQuestions)) * 100)

    const attempt = await ExamAttempt.create({
      assignmentId: params.id,
      userId: String(payload.id),
      answers: questions.map((q: any, idx: number) => ({ questionText: q.text, options: q.options, explanation: q.explanation, selectedIndex: answers[idx] ?? null, correctIndex: q.correctIndex })),
      score,
      totalQuestions,
      violations,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      submittedAt: new Date(),
    })

    // Build ML analysis from history + current attempt
    const history = await loadAllAttempts(String(payload.id))
    const timeline = buildTimeline([...(history.exams||[]), attempt])
    const lr = linearRegression(timeline.map((p, i) => ({ t: i + 1, score: p.score })))
    const predictedNext = lr.predict(timeline.length + 1)
    const passProb = passFailProbability(score, lr.a)
    // Weak topics from practice/quiz history
    const weakTopics = computeWeakTopics({ practices: history.practices || [], quizzes: history.quizzes || [], aptitudes: history.aptitudes || [] })
    // Use existing utility to assemble payload
    const analysisPayload = buildAnalysisPayload(
      timeline.map((p, i) => ({ t: i + 1, score: p.score })),
      weakTopics,
      predictedNext,
      passProb,
    )
    // Enrich with current exam's own category score (assignment domain/topic)
    const assignment = await Assignment.findById(params.id).lean()
    const categoryName = assignment ? `${assignment.domain}:${assignment.topic}` : `assignment:${params.id}`
    const currentCategoryScore = Math.round((correctAnswers / Math.max(1, totalQuestions)) * 100)
    const mergedCategory = [{ name: categoryName, score: currentCategoryScore }]
      .concat((analysisPayload.categoryScores || []).filter((c: any) => c.name !== categoryName))
      .slice(0, 6)
    analysisPayload.categoryScores = mergedCategory
    // Per-subtopic aggregation (heuristic if subtopic missing)
    const substats = aggregatePerSubtopic(questions, answers, assignment?.domain, assignment?.topic)
    ;(analysisPayload as any).perSubtopic = substats
    const baseText = baselineText(score)
    // Personalized recommendations by weak topic (top 3) and weakest subtopics from this attempt
    const topWeak = (analysisPayload.weakTopics || []).slice(0, 3)
    const subWeak = (substats || []).filter(s => s.total >= 1).sort((a,b)=>a.accuracy-b.accuracy).slice(0,3)
    const topicRecs = [
      ...topWeak.map((w: any) => `Focus on ${w.domain}:${w.topic}. Practice targeted sets and review explanations. Consider reading official guides or curated playlists for ${w.topic}.`),
      ...subWeak.map((s: any) => `Strengthen subtopic ${s.subtopic} — your accuracy was ${s.accuracy}%. Practice more problems and revisit explanations.`)
    ]


    const report = await Report.create({
      studentId: String(payload.id),
      assignmentId: params.id,
      category: assignment ? String(assignment.topic) : undefined,
      score,
      totalQuestions,
      correctAnswers,
      strengths: baseText.strengths,
      weaknesses: baseText.weaknesses,
      recommendations: [...baseText.recommendations, ...topicRecs],
      analysis: analysisPayload,
    })

    return NextResponse.json({ ok: true, attemptId: String(attempt._id), reportId: String(report._id) }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to submit exam' }, { status: 500 })
  }
}
