import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import User from '@/models/user'
import QuizAttempt from '@/models/quizAttempt'
import AptitudeAttempt from '@/models/aptitudeAttempt'
import PracticeAttempt from '@/models/practiceAttempt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const [totalUsers, admins, students] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'student' }),
    ])

    const [quizCnt, aptCnt, pracCnt] = await Promise.all([
      QuizAttempt.countDocuments({}),
      AptitudeAttempt.countDocuments({}),
      PracticeAttempt.countDocuments({}),
    ])

    // Accuracy aggregates
    const quizAgg = await QuizAttempt.aggregate([
      { $unwind: '$questions' },
      { $group: { _id: null, total: { $sum: 1 }, correct: { $sum: { $cond: ['$questions.wasCorrect', 1, 0] } } } },
    ])
    const aptAgg = await AptitudeAttempt.aggregate([
      { $unwind: '$questions' },
      { $group: { _id: null, total: { $sum: 1 }, correct: { $sum: { $cond: ['$questions.wasCorrect', 1, 0] } } } },
    ])
    const pracAgg = await PracticeAttempt.aggregate([
      { $unwind: '$questions' },
      { $group: { _id: null, total: { $sum: 1 }, correct: { $sum: { $cond: ['$questions.wasCorrect', 1, 0] } } } },
    ])

    const pct = (agg: any[]) => {
      if (!agg?.length) return 0
      const a = agg[0]
      return a.total ? Math.round((a.correct / a.total) * 100) : 0
    }

    // Top topics (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [topApt, topPrac, topQuiz] = await Promise.all([
      AptitudeAttempt.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$topic', attempts: { $sum: 1 } } },
        { $sort: { attempts: -1 } },
        { $limit: 5 },
      ]),
      PracticeAttempt.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { topic: '$topic', domain: '$domain' }, attempts: { $sum: 1 } } },
        { $sort: { attempts: -1 } },
        { $limit: 5 },
      ]),
      QuizAttempt.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$topic', attempts: { $sum: 1 } } },
        { $sort: { attempts: -1 } },
        { $limit: 5 },
      ]),
    ])

    // Recent activity
    const [recentApt, recentPrac, recentQuiz] = await Promise.all([
      AptitudeAttempt.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      PracticeAttempt.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      QuizAttempt.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    ])

    return NextResponse.json({
      ok: true,
      users: { total: totalUsers, admins, students },
      attempts: {
        quiz: quizCnt,
        aptitude: aptCnt,
        practice: pracCnt,
        accuracy: {
          quiz: pct(quizAgg),
          aptitude: pct(aptAgg),
          practice: pct(pracAgg),
        },
      },
      topTopics: {
        aptitude: topApt.map((x: any) => ({ topic: x._id, attempts: x.attempts })),
        practice: topPrac.map((x: any) => ({ topic: x._id.topic, domain: x._id.domain, attempts: x.attempts })),
        quiz: topQuiz.map((x: any) => ({ topic: x._id, attempts: x.attempts })),
      },
      recent: {
        aptitude: recentApt.map((r: any) => ({ id: String(r._id), userId: String(r.userId), topic: r.topic, score: r.score, total: r.total, date: r.createdAt })),
        practice: recentPrac.map((r: any) => ({ id: String(r._id), userId: String(r.userId), domain: r.domain, topic: r.topic, score: r.score, total: r.total, date: r.createdAt })),
        quiz: recentQuiz.map((r: any) => ({ id: String(r._id), userId: String(r.userId), topic: r.topic, date: r.createdAt })),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load admin stats' }, { status: 500 })
  }
}
