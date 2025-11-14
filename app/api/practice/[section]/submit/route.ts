import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PRACTICE_QUESTIONS } from '@/lib/practice-questions'
import { buildTimeline, buildAnalysisPayload, linearRegression, passFailProbability, loadAllAttempts, computeWeakTopics, aggregatePerSubtopic } from '@/lib/ml'
import Report from '@/models/report'
import ExamAttempt from '@/models/examAttempt'

export async function POST(req: NextRequest, { params }: { params: { section: string } }) {
  try {
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id || payload.role !== 'student') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const answers: number[] = Array.isArray(body?.answers) ? body.answers : []
    const startedAt: string | undefined = body?.startedAt

    const section = decodeURIComponent(params.section)
    const bank = PRACTICE_QUESTIONS[section]
    if (!bank) return NextResponse.json({ ok: false, message: 'Section not found' }, { status: 404 })

    const questions = bank.slice(0, 10).map((q) => ({
      text: q.question,
      options: q.options,
      correctIndex: q.answerIndex,
      explanation: q.explanation,
      subtopic: q.subtopic,
    }))

    const totalQuestions = questions.length
    const correctAnswers = questions.reduce((acc, q, i) => acc + (typeof answers[i] === 'number' && answers[i] === q.correctIndex ? 1 : 0), 0)
    const score = Math.round((correctAnswers / Math.max(1, totalQuestions)) * 100)

    // Build ML insights based on student history
    const history = await loadAllAttempts(String(payload.id))
    const timeline = buildTimeline(history.exams || [])
    const lr = linearRegression(timeline.map((p, i) => ({ t: i + 1, score: p.score })))
    const predictedNext = lr.predict(timeline.length + 1)
    const passProb = passFailProbability(score, lr.a)
    const weakTopics = computeWeakTopics({ practices: history.practices || [], quizzes: history.quizzes || [], aptitudes: history.aptitudes || [] })
    const analysisPayload: any = buildAnalysisPayload(timeline.map((p, i) => ({ t: i + 1, score: p.score })), weakTopics, predictedNext, passProb)

    // Per-subtopic from this practice
    const substats = aggregatePerSubtopic(questions, answers, 'practice', section)
    analysisPayload.perSubtopic = substats
    analysisPayload.categoryScores = [{ name: `practice:${section}`, score }].concat(analysisPayload.categoryScores || []).slice(0, 6)

    // Create a synthetic assignmentId for grouping percentiles per section
    const assignmentId = `practice:${encodeURIComponent(section)}`

    const report = await Report.create({
      studentId: String(payload.id),
      assignmentId,
      category: section,
      score,
      totalQuestions,
      correctAnswers,
      strengths: score >= 85 ? ['Excellent grasp of concepts'] : score >= 70 ? ['Good fundamentals'] : [],
      weaknesses: score < 70 ? ['Needs improvement in fundamentals'] : score < 85 ? ['Some areas need reinforcement'] : [],
      recommendations: substats.sort((a,b)=>a.accuracy-b.accuracy).slice(0,3).map(s => `Practice more ${s.subtopic} — your accuracy was ${s.accuracy}%. Review explanations and attempt targeted sets.`),
      analysis: analysisPayload,
    })

    // Persist a synthetic ExamAttempt so /api/reports/[id]/answers can render review with options
    await ExamAttempt.create({
      assignmentId,
      userId: String(payload.id),
      domain: 'practice',
      topic: section,
      answers: questions.map((q, i) => ({
        questionText: q.text,
        options: q.options,
        explanation: q.explanation,
        selectedIndex: typeof answers[i] === 'number' ? answers[i] : null,
        correctIndex: q.correctIndex,
      })),
      score,
      totalQuestions,
      violations: 0,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      submittedAt: new Date(),
    })

    return NextResponse.json({ ok: true, reportId: String(report._id), score, correctAnswers, totalQuestions })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to submit practice' }, { status: 500 })
  }
}
