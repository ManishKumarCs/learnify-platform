import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import User from '@/models/user'
import Assignment from '@/models/assignment'
import ExamAttempt from '@/models/examAttempt'
import { passFailProbability } from '@/lib/ml'

function monthKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const [totalStudents, attemptsAgg, studentsAgg, assignments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      ExamAttempt.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      ]),
      Assignment.find({}).lean(),
    ])

    const examsCompleted = attemptsAgg[0]?.count || 0
    const avgScore = Math.round((attemptsAgg[0]?.avgScore || 0))
    const activeExams = assignments.filter(a => a.status === 'active').length

    const since = new Date()
    since.setMonth(since.getMonth() - 1)
    const activeUsers = await ExamAttempt.distinct('userId', { createdAt: { $gte: since } }).then(arr => arr.length)

    // Build student growth last 6 months
    const now = new Date()
    const growthKeys: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
      growthKeys.push(monthKey(d))
    }
    const growthMap = new Map<string, number>()
    for (const row of studentsAgg) {
      const d = new Date(row._id.y, row._id.m - 1, 1)
      growthMap.set(monthKey(d), (growthMap.get(monthKey(d)) || 0) + row.count)
    }
    let cumulative = 0
    const studentGrowth = growthKeys.map(k => {
      cumulative += growthMap.get(k) || 0
      return { month: k, students: cumulative, active: Math.round(cumulative * 0.7) }
    })

    // Performance histogram from attempts (score buckets)
    const scores = await ExamAttempt.find({}, { score: 1 }).lean()
    const buckets = [ '0-20%', '20-40%', '40-60%', '60-80%', '80-100%' ]
    const counts = [0,0,0,0,0]
    for (const s of scores) {
      const v = Number((s as any).score || 0)
      const idx = v < 20 ? 0 : v < 40 ? 1 : v < 60 ? 2 : v < 80 ? 3 : 4
      counts[idx]++
    }
    const performanceData = buckets.map((range, i) => ({ range, students: counts[i] }))

    // Recent activity (latest 10 real exam attempts)
    const recentAttempts = await ExamAttempt.find({}, { userId: 1, assignmentId: 1, submittedAt: 1, score: 1 })
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean()
    const recentUserIds = Array.from(new Set(recentAttempts.map((r: any) => String(r.userId))))
    const recentUsers = await User.find({ _id: { $in: recentUserIds } }, { firstName: 1, lastName: 1 }).lean()
    const userMap = new Map<string, any>()
    for (const u of recentUsers) userMap.set(String(u._id), u)
    const assignMap = new Map<string, any>()
    for (const a of assignments) assignMap.set(String((a as any)._id), a)
    const recentActivity = recentAttempts.map((r: any) => {
      const u = userMap.get(String(r.userId))
      const a = assignMap.get(String(r.assignmentId))
      const name = u ? `${u.firstName} ${u.lastName}` : 'Unknown User'
      const title = a?.title || 'Exam'
      return {
        user: name,
        action: `Completed ${title} with ${Math.round(Number(r.score || 0))}%` ,
        time: r.submittedAt || null,
      }
    })

    // Exam status distribution from assignments vs attempts
    let totalAssigned = 0
    for (const a of assignments) totalAssigned += (a.assignedTo || []).length
    const completedPairs = await ExamAttempt.aggregate([
      { $group: { _id: { assignmentId: '$assignmentId', userId: '$userId' } } },
      { $count: 'n' },
    ])
    const completed = completedPairs[0]?.n || 0
    const notStarted = Math.max(0, totalAssigned - completed)
    const inProgress = 0
    const examStats = [
      { name: 'Completed', value: completed, color: '#3b82f6' },
      { name: 'In Progress', value: inProgress, color: '#10b981' },
      { name: 'Not Started', value: notStarted, color: '#f59e0b' },
    ]

    // Readiness distribution: compute latest attempt per student and pass probability bins
    const latestPerUser = await ExamAttempt.aggregate([
      { $sort: { userId: 1, createdAt: -1 } },
      { $group: { _id: '$userId', latestScore: { $first: '$score' }, latestAt: { $first: '$createdAt' } } },
    ])
    let low=0, med=0, high=0
    const atRisk: Array<{ userId: string; probability: number }> = []
    for (const row of latestPerUser) {
      const score = Math.max(0, Math.min(100, Math.round(Number(row.latestScore || 0))))
      const prob = passFailProbability(score, 0) // slope unknown at cohort level
      if (prob < 0.4) low++
      else if (prob < 0.7) med++
      else high++
      atRisk.push({ userId: String(row._id), probability: prob })
    }
    atRisk.sort((a,b)=>a.probability-b.probability)
    const topAtRisk = atRisk.slice(0, 10)
    const readinessDistribution = [
      { band: 'Low (<40%)', students: low, color: '#ef4444' },
      { band: 'Medium (40-70%)', students: med, color: '#f59e0b' },
      { band: 'High (>70%)', students: high, color: '#10b981' },
    ]

    return NextResponse.json({
      ok: true,
      totals: { totalStudents, examsCompleted, avgScore, activeUsers, activeExams },
      studentGrowth,
      performanceData,
      examStats,
      recentActivity,
      readinessDistribution,
      topAtRisk,
    })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to compute overview' }, { status: 500 })
  }
}
