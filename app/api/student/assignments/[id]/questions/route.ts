import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Assignment from '@/models/assignment'
import { APT_QUESTIONS } from '@/lib/aptitude-data'
import { REASONING_QUESTIONS } from '@/lib/reasoning-data'
import { CS_QUESTIONS } from '@/lib/cs-data'
import { DSA_QUESTIONS } from '@/lib/dsa-data'
import ExamAttempt from '@/models/examAttempt'
import { loadAllAttempts, buildTimeline, linearRegression, computeWeakTopics } from '@/lib/ml'

function normalizeTopic(topic?: string) {
  if (!topic) return 'random'
  return topic.replace(/\s+/g, '').toLowerCase()
}

type PracticeQuestion = { question: string; answer: string; options: string[]; explanation?: string; subtopic?: string; difficulty?: 'beginner'|'intermediate'|'advanced' }

function getPool(domain: string, topic: string): PracticeQuestion[] {
  const key = normalizeTopic(topic)
  let pool: PracticeQuestion[] = []
  const pick = (dict: Record<string, PracticeQuestion[]>) => {
    const allTopics = Object.keys(dict)
    if (key === 'random') {
      for (const t of allTopics) pool = pool.concat(dict[t] || [])
    } else {
      if (!dict[key]) return []
      pool = dict[key]
    }
    return pool
  }
  switch (domain) {
    case 'aptitude':
      return pick(APT_QUESTIONS)
    case 'reasoning':
      return pick(REASONING_QUESTIONS)
    case 'cs':
      return pick(CS_QUESTIONS)
    case 'dsa':
      return pick(DSA_QUESTIONS)
    default:
      return []
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const assignment = await Assignment.findById(params.id).lean()
    if (!assignment) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })

    // permission and validity checks
    if (!assignment.assignedTo?.includes(String(payload.id))) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }
    // Block re-attempts: if an ExamAttempt already exists for this assignment and user
    const already = await ExamAttempt.findOne({ assignmentId: String(assignment._id), userId: String(payload.id) }).lean()
    if (already) {
      // Try to find a report to redirect to
      let reportId: string | undefined
      try {
        const { default: Report } = await import('@/models/report')
        const rep = await Report.findOne({ studentId: String(payload.id), assignmentId: String(assignment._id) }).select('_id').lean()
        if (rep) reportId = String((rep as any)._id)
      } catch {}
      return NextResponse.json({ ok: false, code: 'ALREADY_COMPLETED', reportId, message: 'You have already completed this exam.' }, { status: 400 })
    }
    if (assignment.status !== 'active') {
      return NextResponse.json({ ok: false, message: 'Assignment is not active' }, { status: 400 })
    }
    if (assignment.dueAt && new Date(assignment.dueAt) < new Date()) {
      return NextResponse.json({ ok: false, message: 'Assignment due date passed' }, { status: 400 })
    }

    const url = new URL(req.url)
    const isPreview = ['1','true','yes'].includes(String(url.searchParams.get('preview')||'').toLowerCase())

    const pool = getPool(assignment.domain, assignment.topic)
    if (!pool || pool.length === 0) {
      return NextResponse.json({ ok: false, message: 'No questions available for topic' }, { status: 400 })
    }

    const limit = Math.max(1, Math.min(Number(assignment.limit || 10), 100))

    // Adaptive selection based on student's predicted score and per-topic mastery
    // 1) Load student's history and estimate predicted score via linear regression over exam scores
    let predicted = 50
    try {
      const history = await loadAllAttempts(String(payload.id))
      const timeline = buildTimeline(history.exams || [])
      const series = timeline.map((p, i) => ({ t: i + 1, score: p.score }))
      const lr = linearRegression(series)
      const predictedNext = lr.predict(series.length + 1)
      if (typeof predictedNext === 'number' && isFinite(predictedNext)) {
        predicted = Math.max(0, Math.min(100, Math.round(predictedNext)))
      }
    } catch {}

    // 2) Compute per-topic mastery from practice/quiz/aptitude
    let mastery = 60
    try {
      const historyMaster = await loadAllAttempts(String(payload.id))
      const weak = computeWeakTopics({ practices: historyMaster.practices || [], quizzes: historyMaster.quizzes || [], aptitudes: historyMaster.aptitudes || [] })
      const norm = (s?: string) => (s || '').toString().toLowerCase().replace(/\s+/g, '')
      const domainKey = norm(assignment.domain)
      const topicKey = norm(assignment.topic)
      // prefer exact domain:topic match
      const entry = weak.find(w => norm(w.topic) === topicKey && norm(w.domain||'') === domainKey)
        || weak.find(w => norm(w.topic) === topicKey)
      if (entry && typeof entry.accuracy === 'number') mastery = Math.max(0, Math.min(100, entry.accuracy))
    } catch {}

    // 3) Difficulty classifier prefers metadata, falls back to heuristic
    type Diff = 'beginner'|'intermediate'|'advanced'
    const classify = (q: PracticeQuestion): Diff => {
      if (q.difficulty === 'beginner' || q.difficulty === 'intermediate' || q.difficulty === 'advanced') return q.difficulty
      const text = (q.question || '').toLowerCase()
      const len = text.length
      const advHints = [/dynamic\s+programming|dp/, /graph|tree|trie|heap/, /complexity|big\s*o/, /permutation|combination/, /probab/]
      const begHints = [/basic|fundamental|intro|beginner/, /true|false/]
      if (advHints.some(r => r.test(text)) || len > 160) return 'advanced'
      if (begHints.some(r => r.test(text)) || len < 80) return 'beginner'
      return 'intermediate'
    }

    const buckets: Record<Diff, PracticeQuestion[]> = { beginner: [], intermediate: [], advanced: [] }
    for (const q of pool) buckets[classify(q)].push(q)

    // 4) Determine target mix by combining mastery and predicted
    // Mastery bands drive primary mix; predicted nudges within band
    const mixFrom = (score: number): Record<Diff, number> => {
      if (score < 50) return { beginner: 0.7, intermediate: 0.25, advanced: 0.05 }
      if (score <= 70) return { beginner: 0.3, intermediate: 0.5, advanced: 0.2 }
      return { beginner: 0.2, intermediate: 0.4, advanced: 0.4 }
    }
    const m1 = mixFrom(mastery)
    const m2 = mixFrom(predicted)
    // average the weights
    const mix: Record<Diff, number> = {
      beginner: (m1.beginner + m2.beginner) / 2,
      intermediate: (m1.intermediate + m2.intermediate) / 2,
      advanced: (m1.advanced + m2.advanced) / 2,
    }

    const targetCounts: Record<Diff, number> = {
      beginner: Math.floor(limit * mix.beginner),
      intermediate: Math.floor(limit * mix.intermediate),
      advanced: Math.floor(limit * mix.advanced),
    }
    // Adjust rounding to meet exact limit
    let allocated = targetCounts.beginner + targetCounts.intermediate + targetCounts.advanced
    while (allocated < limit) {
      // allocate remaining to the bucket with most remaining supply
      const remaining: Array<[Diff, number]> = (['beginner','intermediate','advanced'] as Diff[]).map(k => [k, buckets[k].length - targetCounts[k]])
      remaining.sort((a,b) => b[1]-a[1])
      const k = remaining[0][0]
      targetCounts[k] += 1
      allocated += 1
    }

    if (isPreview) {
      return NextResponse.json({
        ok: true,
        preview: {
          domain: assignment.domain,
          topic: assignment.topic,
          limit,
          mastery,
          predicted,
          mix,
          targetCounts,
          availableCounts: {
            beginner: buckets.beginner.length,
            intermediate: buckets.intermediate.length,
            advanced: buckets.advanced.length,
          },
        },
      })
    }

    const shuffle = <T,>(arr: T[]) => arr.sort(() => Math.random() - 0.5)
    const take = <T,>(arr: T[], n: number) => arr.slice(0, Math.max(0, Math.min(n, arr.length)))

    let selected: PracticeQuestion[] = []
    selected = selected.concat(take(shuffle(buckets.beginner), targetCounts.beginner))
    selected = selected.concat(take(shuffle(buckets.intermediate), targetCounts.intermediate))
    selected = selected.concat(take(shuffle(buckets.advanced), targetCounts.advanced))

    // If still short due to sparse buckets, fill from the remaining pool
    if (selected.length < limit) {
      const selectedSet = new Set(selected.map((q) => q.question))
      const remainingPool = shuffle(pool.filter(q => !selectedSet.has(q.question)))
      selected = selected.concat(remainingPool.slice(0, limit - selected.length))
    }

    const sampled = selected

    // map to exam payload, include correctIndex computed from options
    const questions = sampled.map((q) => ({
      text: q.question,
      options: q.options,
      correctIndex: Math.max(0, q.options.findIndex((o) => o === q.answer)),
      explanation: q.explanation,
    }))

    return NextResponse.json({ ok: true, domain: assignment.domain, topic: assignment.topic, count: questions.length, questions })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load assignment questions' }, { status: 500 })
  }
}
