import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PRACTICE_QUESTIONS } from '@/lib/practice-questions'

export async function GET(req: NextRequest, { params }: { params: { section: string } }) {
  const token = req.cookies.get('token')?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload?.id || payload.role !== 'student') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

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

  return NextResponse.json({ ok: true, section, questions })
}
