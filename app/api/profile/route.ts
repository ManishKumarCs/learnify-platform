import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User, { IUser } from '@/models/user'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await connectDB()
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload || !payload.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const user = (await User.findById(payload.id).lean()) as IUser | null
  if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profile: user.profile || {},
  })
}

export async function PUT(req: NextRequest) {
  await connectDB()
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload || !payload.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { firstName, lastName, academicBackground, targetExams, strengths, weaknesses, collegeName, universityRollNumber, section, classRollNumber, branch, course, leetcodeId, githubId, privacy } = body || {}

  // Validate roll numbers & URLs/handles
  if (universityRollNumber !== undefined && typeof universityRollNumber === 'string' && !/^[A-Za-z0-9\-_/]{4,20}$/.test(universityRollNumber)) {
    return NextResponse.json({ message: 'Invalid university roll number format' }, { status: 400 })
  }
  if (classRollNumber !== undefined && typeof classRollNumber === 'string' && !/^\d{1,4}$/.test(classRollNumber)) {
    return NextResponse.json({ message: 'Invalid class roll number format' }, { status: 400 })
  }
  const isUrl = (s: string) => /^https?:\/\//i.test(s)
  if (githubId !== undefined && typeof githubId === 'string') {
    const ok = isUrl(githubId) || /^[A-Za-z0-9-]{1,39}$/.test(githubId)
    if (!ok) return NextResponse.json({ message: 'Invalid GitHub handle or URL' }, { status: 400 })
  }
  if (leetcodeId !== undefined && typeof leetcodeId === 'string') {
    const ok = isUrl(leetcodeId) || /^[A-Za-z0-9_-]{1,30}$/.test(leetcodeId)
    if (!ok) return NextResponse.json({ message: 'Invalid LeetCode handle or URL' }, { status: 400 })
  }

  // Build dotted updates to not overwrite other profile fields
  const set: Record<string, any> = {}
  if (firstName !== undefined) set['firstName'] = firstName
  if (lastName !== undefined) set['lastName'] = lastName
  const fields = {
    academicBackground,
    targetExams,
    strengths,
    weaknesses,
    collegeName,
    universityRollNumber,
    section,
    classRollNumber,
    branch,
    course,
    leetcodeId,
    githubId,
  } as Record<string, any>
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) set[`profile.${k}`] = v
  }
  if (privacy && typeof privacy === 'object') {
    if (typeof privacy.showEmail === 'boolean') set['profile.privacy.showEmail'] = privacy.showEmail
    if (typeof privacy.showSocialIds === 'boolean') set['profile.privacy.showSocialIds'] = privacy.showSocialIds
  }

  const updated = (await User.findByIdAndUpdate(payload.id, { $set: set }, { new: true, runValidators: true })) as IUser | null
  if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ok: true,
    message: 'Profile updated',
    user: {
      id: String(updated._id),
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      role: updated.role,
      profile: updated.profile || {},
    },
  })
}
