import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Assignment from '@/models/assignment'
import ExamAttempt from '@/models/examAttempt'
import Report from '@/models/report'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const items = await Assignment.find({
      status: 'active',
      $or: [
        { dueAt: { $exists: false } },
        { dueAt: { $gte: now } },
      ],
      assignedTo: { $in: [String(payload.id)] },
    }).sort({ createdAt: -1 }).lean()

    const ids = items.map((a: any) => String(a._id))
    const [attempts, reports] = await Promise.all([
      ExamAttempt.find({ userId: String(payload.id), assignmentId: { $in: ids } }).select('assignmentId').lean(),
      Report.find({ studentId: String(payload.id), assignmentId: { $in: ids } }).select('_id assignmentId').lean(),
    ])
    const attemptedSet = new Set(attempts.map((x: any) => String(x.assignmentId)))
    const reportMap = new Map<string, string>()
    for (const r of reports) reportMap.set(String((r as any).assignmentId), String((r as any)._id))

    return NextResponse.json({ ok: true, assignments: items.map((a: any) => ({
      id: String(a._id),
      title: a.title,
      domain: a.domain,
      topic: a.topic,
      limit: a.limit,
      dueAt: a.dueAt,
      createdAt: a.createdAt,
      taken: attemptedSet.has(String(a._id)),
      reportId: reportMap.get(String(a._id)) || null,
    })) })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to load assignments' }, { status: 500 })
  }
}
