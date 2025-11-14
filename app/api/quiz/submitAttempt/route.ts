import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import QuizAttempt, { IQuizAttempt, IQuestionAttempt } from '@/models/quizAttempt'

export type SubmitAttemptBody = {
  userId: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: Array<{ questionId: string; wasCorrect: boolean; timeTaken: number }>
  totalTime: number
}

export type SubmitAttemptResponse = {
  ok: boolean
  id?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = (await req.json()) as SubmitAttemptBody

    // Basic validation
    if (!body?.userId || !body?.topic || !body?.difficulty || !Array.isArray(body?.questions) || typeof body?.totalTime !== 'number') {
      return NextResponse.json<SubmitAttemptResponse>({ ok: false, message: 'Invalid payload' }, { status: 400 })
    }

    const normalizedDifficulty = body.difficulty.toLowerCase()
    if (!['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
      return NextResponse.json<SubmitAttemptResponse>({ ok: false, message: 'Invalid difficulty' }, { status: 400 })
    }

    const qItems: IQuestionAttempt[] = body.questions.map((q) => ({
      questionId: String(q.questionId),
      wasCorrect: Boolean(q.wasCorrect),
      timeTaken: Number(q.timeTaken),
    }))

    const doc: Partial<IQuizAttempt> = {
      userId: body.userId,
      topic: body.topic,
      difficulty: normalizedDifficulty as 'easy' | 'medium' | 'hard',
      questions: qItems,
      totalTime: body.totalTime,
    }

    const created = await QuizAttempt.create(doc)

    return NextResponse.json<SubmitAttemptResponse>({ ok: true, id: String(created._id) }, { status: 201 })
  } catch (err: any) {
    const message = err?.message || 'Failed to store attempt'
    return NextResponse.json<SubmitAttemptResponse>({ ok: false, message }, { status: 500 })
  }
}
