import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Report from '@/models/report'
import ExamAttempt from '@/models/examAttempt'
import Assignment from '@/models/assignment'
import { APT_QUESTIONS } from '@/lib/aptitude-data'
import { REASONING_QUESTIONS } from '@/lib/reasoning-data'
import { CS_QUESTIONS } from '@/lib/cs-data'
import { DSA_QUESTIONS } from '@/lib/dsa-data'
import { PRACTICE_QUESTIONS } from '@/lib/practice-questions'

type PracticeQuestion = { question: string; answer: string; options: string[]; explanation?: string }

function normalizeTopic(topic?: string) {
  if (!topic) return 'random'
  return topic.replace(/\s+/g, '').toLowerCase()
}

function getPool(domain: string, topic: string): PracticeQuestion[] {
  const key = normalizeTopic(topic)
  const pick = (dict: Record<string, PracticeQuestion[]>) => {
    const allTopics = Object.keys(dict)
    if (key === 'random') {
      return allTopics.flatMap((t) => dict[t] || [])
    }
    return dict[key] || []
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
    if (!payload?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const report = await Report.findById(params.id).lean()
    if (!report) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    if (String(report.studentId) !== String(payload.id)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const attempt = await ExamAttempt.findOne({ assignmentId: String(report.assignmentId), userId: String(payload.id) }).lean()
    if (!attempt) {
      // Fallback for practice reports created before attempts were persisted
      const aid = String(report.assignmentId)
      if (aid.startsWith('practice:')) {
        const section = decodeURIComponent(aid.slice('practice:'.length))
        const bank = PRACTICE_QUESTIONS[section]
        if (bank && bank.length) {
          const questions = bank.slice(0, 10).map((q, idx) => ({
            index: idx + 1,
            text: q.question,
            options: q.options,
            explanation: q.explanation,
            correctIndex: q.answerIndex,
            selectedIndex: null,
            wasCorrect: false,
          }))
          return NextResponse.json({ ok: true, questions, note: 'Reconstructed from practice bank (no attempt stored)' })
        }
      }
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 })
    }

    // Try to enrich from the assignment pools if options/explanations are missing
    const aidStr = String(report.assignmentId)
    let pool: PracticeQuestion[] = []
    if (aidStr.startsWith('practice:')) {
      const section = decodeURIComponent(aidStr.slice('practice:'.length))
      const bank = PRACTICE_QUESTIONS[section]
      if (bank) {
        // map to PracticeQuestion type shape expected by enrichment
        pool = bank.map(q => ({ question: q.question, answer: q.options[q.answerIndex], options: q.options, explanation: q.explanation }))
      }
    } else {
      const assignment = await Assignment.findById(aidStr).lean()
      pool = assignment ? getPool(String(assignment.domain), String(assignment.topic)) : []
    }

    const questions = (attempt.answers || []).map((a: any, idx: number) => {
      let options: string[] = Array.isArray(a.options) ? a.options : []
      let explanation: string | null = a.explanation || null
      let correctIndex: number | null = typeof a.correctIndex === 'number' ? a.correctIndex : null
      if ((!options || options.length === 0) && pool.length) {
        const found = pool.find(q => q.question === a.questionText)
        if (found) {
          options = found.options
          explanation = found.explanation || explanation
          if (correctIndex === null || correctIndex === undefined) {
            const idxCorrect = found.options.findIndex(o => o === found.answer)
            correctIndex = idxCorrect >= 0 ? idxCorrect : null
          }
        }
      }
      const selectedIndex: number | null = typeof a.selectedIndex === 'number' ? a.selectedIndex : null
      const wasCorrect = typeof correctIndex === 'number' && typeof selectedIndex === 'number' && correctIndex === selectedIndex
      return {
        index: idx + 1,
        text: a.questionText,
        options,
        explanation,
        correctIndex,
        selectedIndex,
        wasCorrect,
      }
    })

    return NextResponse.json({ ok: true, questions })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to load answers' }, { status: 500 })
  }
}
