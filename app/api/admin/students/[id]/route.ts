import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import mongoose from 'mongoose'
import User from '@/models/user'
import QuizAttempt from '@/models/quizAttempt'
import AptitudeAttempt from '@/models/aptitudeAttempt'
import PracticeAttempt from '@/models/practiceAttempt'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const id = params.id
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, message: 'Invalid id' }, { status: 400 })
    }

    const user = await User.findById(id).select('_id firstName lastName email phone createdAt profile').lean()
    if (!user) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })

    const [quiz, apt, prac] = await Promise.all([
      QuizAttempt.find({ userId: String(user._id) }).sort({ createdAt: -1 }).lean(),
      AptitudeAttempt.find({ userId: String(user._id) }).sort({ createdAt: -1 }).lean(),
      PracticeAttempt.find({ userId: String(user._id) }).sort({ createdAt: -1 }).lean(),
    ])

    // Build summary
    const attemptsTotal = quiz.length + apt.length + prac.length

    const correctTotal =
      (apt as any[]).reduce((a, b) => a + Number((b as any).score || 0), 0) +
      (prac as any[]).reduce((a, b) => a + Number((b as any).score || 0), 0) +
      (quiz as any[]).reduce((a, b) => a + (((b as any).questions || []).filter((q: any) => q.wasCorrect).length || 0), 0)

    const questionsTotal =
      (apt as any[]).reduce((a, b) => a + Number((b as any).total || ((b as any).questions?.length || 0)), 0) +
      (prac as any[]).reduce((a, b) => a + Number((b as any).total || ((b as any).questions?.length || 0)), 0) +
      (quiz as any[]).reduce((a, b) => a + Number(((b as any).questions || []).length || 0), 0)

    const avgScore = questionsTotal > 0 ? Math.round((correctTotal / questionsTotal) * 100) : 0

    // Compose recent attempts list (last 10)
    const recent = [
      ...apt.map((x: any) => ({ id: String(x._id), kind: 'aptitude', topic: x.topic, score: x.score, total: x.total, date: x.createdAt })),
      ...prac.map((x: any) => ({ id: String(x._id), kind: x.domain, topic: x.topic, score: x.score, total: x.total, date: x.createdAt })),
      ...quiz.map((x: any) => ({ id: String(x._id), kind: 'quiz', topic: x.topic || 'quiz', score: (x.questions||[]).filter((q:any)=>q.wasCorrect).length, total: (x.questions||[]).length, date: x.createdAt })),
    ].sort((a, b) => new Date(b.date as any).getTime() - new Date(a.date as any).getTime()).slice(0, 10)

    // Category Scores: derive topic-wise accuracy from practice + aptitude + quiz topics
    const topicMap: Record<string, { correct: number; total: number }> = {}
    const addT = (t: string, c: number, tot: number) => {
      if (!t) return
      if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 }
      topicMap[t].correct += c
      topicMap[t].total += tot
    }
    for (const a of apt as any[]) addT(a.topic, Number(a.score||0), Number(a.total||0))
    for (const p of prac as any[]) addT(p.topic, Number(p.score||0), Number(p.total||0))
    for (const qz of quiz as any[]) addT(qz.topic||'quiz', (qz.questions||[]).filter((q:any)=>q.wasCorrect).length, (qz.questions||[]).length)

    const categoryScores = Object.entries(topicMap).map(([topic, v]) => ({ category: topic, score: v.total>0? Math.round((v.correct/v.total)*100):0 }))

    return NextResponse.json({
      ok: true,
      student: {
        id: String(user._id),
        name: `${user.firstName||''} ${user.lastName||''}`.trim(),
        email: user.email,
        phone: (user as any).phone || '',
        joined: user.createdAt,
        profile: {
          academicBackground: (user as any).profile?.academicBackground || '',
          targetExams: (user as any).profile?.targetExams || '',
          strengths: (user as any).profile?.strengths || '',
          weaknesses: (user as any).profile?.weaknesses || '',
          collegeName: (user as any).profile?.collegeName || '',
          universityRollNumber: (user as any).profile?.universityRollNumber || '',
          section: (user as any).profile?.section || '',
          classRollNumber: (user as any).profile?.classRollNumber || '',
          branch: (user as any).profile?.branch || '',
          course: (user as any).profile?.course || '',
          leetcodeId: (user as any).profile?.leetcodeId || '',
          githubId: (user as any).profile?.githubId || '',
          privacy: (user as any).profile?.privacy || { showEmail: false, showSocialIds: false },
        },
      },
      summary: {
        totalExams: attemptsTotal,
        averageScore: avgScore,
        lastExamDate: recent[0]?.date || null,
      },
      recent,
      categoryScores,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load student' }, { status: 500 })
  }
}
