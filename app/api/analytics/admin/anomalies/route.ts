import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import ExamAttempt from '@/models/examAttempt'

function avg(nums: number[]) { return nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : 0 }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }

function computeRisk(attempt: any) {
  const violations = Number(attempt.violations || 0)
  const v = clamp01(violations / 3)
  const times: number[] = (attempt.answers || [])
    .map((a: any) => Number(a?.timeTaken))
    .filter((t: any) => Number.isFinite(t) && t > 0)
  const meanT = avg(times)
  const fastness = meanT ? clamp01((12 - meanT) / 12) : 0 // <12s avg is increasingly risky
  const veryFastFrac = times.length ? times.filter((t) => t < 5).length / times.length : 0
  const score = Number(attempt.score || 0)
  const suspiciousHigh = (score >= 85 && fastness > 0.5) ? 0.3 : 0
  const risk = clamp01(0.5 * v + 0.3 * fastness + 0.2 * veryFastFrac + suspiciousHigh)
  return { risk, violations, meanT, veryFastFrac, score }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const limit = Math.max(10, Math.min(100, Number(new URL(req.url).searchParams.get('limit') || 20)))
    const attempts = await ExamAttempt.find({}).sort({ createdAt: -1 }).limit(200).lean()

    const enriched = attempts.map((a: any) => {
      const r = computeRisk(a)
      return {
        id: String(a._id),
        userId: String(a.userId),
        assignmentId: String(a.assignmentId),
        createdAt: a.createdAt,
        submittedAt: a.submittedAt,
        domain: a.domain,
        topic: a.topic,
        score: Math.round(Number(a.score || 0)),
        violations: r.violations,
        meanAnswerTime: r.meanT || null,
        veryFastFraction: Number(r.veryFastFrac.toFixed(2)),
        risk: Number(r.risk.toFixed(2)),
      }
    })

    enriched.sort((a,b) => b.risk - a.risk)
    const top = enriched.slice(0, limit)
    const avgRisk = enriched.length ? Number((enriched.reduce((s,a)=>s+a.risk,0)/enriched.length).toFixed(2)) : 0
    const flagged = enriched.filter(a => a.risk >= 0.6).length

    return NextResponse.json({ ok: true, avgRisk, flagged, total: enriched.length, anomalies: top })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to compute anomalies' }, { status: 500 })
  }
}
