import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Assignment from '@/models/assignment'
import User from '@/models/user'

function normalizeTopic(topic?: string) {
  if (!topic) return ''
  return topic.replace(/\s+/g, '').toLowerCase()
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const domain = searchParams.get('domain') || undefined
    const status = searchParams.get('status') || undefined

    const query: any = {}
    if (domain) query.domain = domain
    if (status) query.status = status

    const items = await Assignment.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ ok: true, assignments: items.map((a: any) => ({
      id: String(a._id),
      title: a.title,
      domain: a.domain,
      topic: a.topic,
      limit: a.limit,
      assignedTo: a.assignedTo,
      dueAt: a.dueAt,
      status: a.status,
      createdBy: a.createdBy,
      createdAt: a.createdAt,
    })) })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to list assignments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const title = String(body.title || '').trim()
    const domain = String(body.domain || '') as 'aptitude'|'reasoning'|'cs'|'dsa'|'quiz'
    const topic = normalizeTopic(String(body.topic || ''))
    const limit = Math.max(1, Math.min(Number(body.limit || 10), 100))
    const assignedTo = Array.isArray(body.assignedTo) ? body.assignedTo.map((x: any) => String(x)) : []
    const dueAt = body.dueAt ? new Date(body.dueAt) : undefined
    const status = (body.status as any) || 'active'

    if (!title || !domain || !topic || assignedTo.length === 0) {
      return NextResponse.json({ ok: false, message: 'Missing required fields' }, { status: 400 })
    }

    // verify students exist
    const count = await User.countDocuments({ _id: { $in: assignedTo }, role: 'student' })
    if (count !== assignedTo.length) {
      return NextResponse.json({ ok: false, message: 'One or more student IDs invalid' }, { status: 400 })
    }

    const created = await Assignment.create({
      title,
      domain,
      topic,
      limit,
      assignedTo,
      dueAt,
      status,
      createdBy: String(payload.id),
    })

    return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to create assignment' }, { status: 500 })
  }
}
