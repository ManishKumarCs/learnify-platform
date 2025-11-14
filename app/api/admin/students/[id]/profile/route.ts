import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import User from '@/models/user'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Validation
    const uni = body.universityRollNumber
    const cls = body.classRollNumber
    const github = body.githubId
    const leet = body.leetcodeId
    if (uni !== undefined && typeof uni === 'string' && !/^[A-Za-z0-9\-_/]{4,20}$/.test(uni)) {
      return NextResponse.json({ ok: false, message: 'Invalid university roll number format' }, { status: 400 })
    }
    if (cls !== undefined && typeof cls === 'string' && !/^\d{1,4}$/.test(cls)) {
      return NextResponse.json({ ok: false, message: 'Invalid class roll number format' }, { status: 400 })
    }
    const isUrl = (s: string) => /^https?:\/\//i.test(s)
    if (github !== undefined && typeof github === 'string') {
      const ok = isUrl(github) || /^[A-Za-z0-9-]{1,39}$/.test(github)
      if (!ok) return NextResponse.json({ ok: false, message: 'Invalid GitHub handle or URL' }, { status: 400 })
    }
    if (leet !== undefined && typeof leet === 'string') {
      const ok = isUrl(leet) || /^[A-Za-z0-9_-]{1,30}$/.test(leet)
      if (!ok) return NextResponse.json({ ok: false, message: 'Invalid LeetCode handle or URL' }, { status: 400 })
    }

    // Build dotted $set to avoid overwriting profile
    const set: Record<string, any> = {}
    if (typeof body.phone === 'string') set['phone'] = body.phone
    const profFields = ['academicBackground','targetExams','strengths','weaknesses','collegeName','universityRollNumber','classRollNumber','section','branch','course','leetcodeId','githubId'] as const
    for (const k of profFields) {
      if (body[k] !== undefined) set[`profile.${k}`] = body[k]
    }
    if (body.privacy && typeof body.privacy === 'object') {
      if (typeof body.privacy.showEmail === 'boolean') set['profile.privacy.showEmail'] = body.privacy.showEmail
      if (typeof body.privacy.showSocialIds === 'boolean') set['profile.privacy.showSocialIds'] = body.privacy.showSocialIds
    }

    const doc = await User.findByIdAndUpdate(params.id, { $set: set }, { new: true, runValidators: true }).lean()
    if (!doc) return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Failed to update profile' }, { status: 500 })
  }
}
