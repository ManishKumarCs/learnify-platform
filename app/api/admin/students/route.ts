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

    // Optional filters
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const branch = (searchParams.get('branch') || '').trim()
    const course = (searchParams.get('course') || '').trim()
    const section = (searchParams.get('section') || '').trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))

    const userFilter: any = { role: 'student' }
    if (branch) userFilter['profile.branch'] = branch
    if (course) userFilter['profile.course'] = course
    if (section) userFilter['profile.section'] = section

    const users = await User.find(userFilter).select('_id firstName lastName email createdAt profile.universityRollNumber profile.classRollNumber').lean()

    const ids = users.map((u: any) => String(u._id))

    // Aggregate attempts per user
    const [quizAgg, aptAgg, pracAgg] = await Promise.all([
      QuizAttempt.aggregate([
        { $match: { userId: { $in: ids } } },
        { $unwind: '$questions' },
        { $group: { _id: '$userId', total: { $sum: 1 }, correct: { $sum: { $cond: ['$questions.wasCorrect', 1, 0] } } } },
      ]),
      AptitudeAttempt.aggregate([
        { $match: { userId: { $in: ids } } },
        { $group: { _id: '$userId', total: { $sum: '$total' }, correct: { $sum: '$score' }, attempts: { $sum: 1 } } },
      ]),
      PracticeAttempt.aggregate([
        { $match: { userId: { $in: ids } } },
        { $group: { _id: '$userId', total: { $sum: '$total' }, correct: { $sum: '$score' }, attempts: { $sum: 1 } } },
      ]),
    ])

    const byId: Record<string, { attempts: number; correct: number; total: number }> = {}

    const add = (uid: string, corr: number, tot: number, atts?: number) => {
      if (!byId[uid]) byId[uid] = { attempts: 0, correct: 0, total: 0 }
      byId[uid].correct += corr
      byId[uid].total += tot
      byId[uid].attempts += atts ?? 0
    }

    for (const r of quizAgg) {
      add(String(r._id), r.correct || 0, r.total || 0)
      byId[String(r._id)].attempts += 1 // coarse: count quiz group as 1 attempt bucket
    }
    for (const r of aptAgg) {
      add(String(r._id), r.correct || 0, r.total || 0, r.attempts || 0)
    }
    for (const r of pracAgg) {
      add(String(r._id), r.correct || 0, r.total || 0, r.attempts || 0)
    }

    const rowsAll = users
      .map((u: any) => {
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim()
        const stats = byId[String(u._id)] || { attempts: 0, correct: 0, total: 0 }
        const avgScore = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
        const examsCompleted = stats.attempts
        return {
          id: String(u._id),
          name,
          email: u.email,
          joined: u.createdAt,
          examsCompleted,
          avgScore,
        }
      })
      .filter((s, idx) => {
        if (!q) return true
        const u = users[idx] as any
        const roll = String(u?.profile?.universityRollNumber || '').toLowerCase()
        const classRoll = String(u?.profile?.classRollNumber || '').toLowerCase()
        return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || roll.includes(q) || classRoll.includes(q)
      })

    const total = rowsAll.length
    const start = (page - 1) * limit
    const rows = rowsAll.slice(start, start + limit)

    return NextResponse.json({ ok: true, students: rows, total, page, limit })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load students' }, { status: 500 })
  }
}
