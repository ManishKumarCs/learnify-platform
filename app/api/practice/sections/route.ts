import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { PRACTICE_SECTIONS } from '@/lib/practice-questions'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload?.id || payload.role !== 'student') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, sections: PRACTICE_SECTIONS })
}
