import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import ExamAttempt from '@/models/examAttempt'
import User from '@/models/user'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || (payload.role !== 'student' && payload.role !== 'admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)

    // Aggregate leaderboard from real exam attempts only (exclude practice/quiz/aptitude)
    const agg = await ExamAttempt.aggregate([
      {
        $group: {
          _id: '$userId',
          avgScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          examsCount: { $sum: 1 },
          latestSubmitted: { $max: '$submittedAt' },
        },
      },
      { $sort: { avgScore: -1, examsCount: -1, latestSubmitted: -1 } },
      { $limit: limit },
    ])

    // Load user names/emails
    const userIds = agg.map((a) => String(a._id))
    const users = await User.find({ _id: { $in: userIds } }, { firstName: 1, lastName: 1, email: 1 }).lean()
    const userMap = new Map<string, any>()
    for (const u of users) userMap.set(String(u._id), u)

    const rows = agg.map((a, i) => {
      const u = userMap.get(String(a._id))
      const name = u ? `${u.firstName} ${u.lastName}` : 'Unknown'
      return {
        rank: i + 1,
        userId: String(a._id),
        name,
        email: u?.email,
        avgScore: Math.round(a.avgScore ?? 0),
        bestScore: Math.round(a.bestScore ?? 0),
        examsCount: a.examsCount ?? 0,
        latestSubmitted: a.latestSubmitted || null,
      }
    })

    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to load leaderboard' }, { status: 500 })
  }
}
