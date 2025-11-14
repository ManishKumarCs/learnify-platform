import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Assignment from '@/models/assignment'
import User from '@/models/user'
import AptitudeAttempt from '@/models/aptitudeAttempt'
import PracticeAttempt from '@/models/practiceAttempt'
import QuizAttempt from '@/models/quizAttempt'
import ExamAttempt from '@/models/examAttempt'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })

    const id = params.id
    const a = await Assignment.findById(id).lean()
    if (!a) return NextResponse.json({ ok: false, message: 'Assignment not found' }, { status: 404 })
    const assignment = {
      _id: String(a._id),
      domain: a.domain as string,
      topic: a.topic as string,
      limit: a.limit as number,
      dueAt: a.dueAt as Date | undefined,
      assignedTo: (a.assignedTo || []) as string[],
      title: a.title as string,
      status: a.status as string,
      createdAt: a.createdAt as Date,
    }

    const users = await User.find({ _id: { $in: assignment.assignedTo }, role: 'student' }).select('_id firstName lastName email').lean()
    const now = new Date()

    async function latestForStudent(uid: string) {
      // Prefer true exam submissions tied to this assignment
      const exam = await ExamAttempt.find({ assignmentId: String(assignment._id), userId: uid }).sort({ createdAt: -1 }).limit(1).lean()
      if (exam.length) {
        const e: any = exam[0]
        return { date: e.createdAt as Date, score: Number(e.score||0), total: Number(e.totalQuestions||0) }
      }
      // Backwards-compatible fallbacks by domain/topic
      if (assignment.domain === 'aptitude') {
        const items = await AptitudeAttempt.find({ userId: uid, topic: assignment.topic }).sort({ createdAt: -1 }).limit(1).lean()
        if (!items.length) return null
        const it: any = items[0]
        return { date: it.createdAt as Date, score: Number(it.score||0), total: Number(it.total||0) }
      } else if (assignment.domain === 'quiz') {
        const items = await QuizAttempt.find({ userId: uid, topic: assignment.topic }).sort({ createdAt: -1 }).limit(1).lean()
        if (!items.length) return null
        const it: any = items[0]
        const qs = (it.questions||[]) as any[]
        const correct = qs.filter(q => q.wasCorrect).length
        return { date: it.createdAt as Date, score: correct, total: qs.length }
      } else {
        const items = await PracticeAttempt.find({ userId: uid, domain: assignment.domain, topic: assignment.topic }).sort({ createdAt: -1 }).limit(1).lean()
        if (!items.length) return null
        const it: any = items[0]
        return { date: it.createdAt as Date, score: Number(it.score||0), total: Number(it.total||0) }
      }
    }

    const rows = [] as any[]
    let completed = 0, pending = 0, expired = 0

    for (const u of users) {
      const uid = String(u._id)
      const latest = await latestForStudent(uid)
      let status: 'completed' | 'pending' | 'expired' = 'pending'
      if (latest) status = 'completed'
      else if (a.dueAt && new Date(a.dueAt) < now) status = 'expired'

      if (status === 'completed') completed++
      else if (status === 'expired') expired++
      else pending++

      rows.push({
        studentId: uid,
        studentName: `${(u as any).firstName||''} ${(u as any).lastName||''}`.trim() || (u as any).email,
        studentEmail: (u as any).email,
        status,
        score: latest ? latest.score : undefined,
        total: latest ? latest.total : undefined,
        submittedAt: latest ? latest.date : undefined,
      })
    }

    return NextResponse.json({
      ok: true,
      assignment: {
        id: assignment._id, title: assignment.title, domain: assignment.domain, topic: assignment.topic, limit: assignment.limit, dueAt: assignment.dueAt, status: assignment.status, createdAt: assignment.createdAt,
      },
      stats: { completed, pending, expired, total: users.length },
      students: rows,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load assignment status' }, { status: 500 })
  }
}
