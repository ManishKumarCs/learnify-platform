import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Report from '@/models/report'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const token = req.cookies.get('token')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const report = await Report.findById(params.id).lean()
    if (!report) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    const isOwner = String(report.studentId) === String(payload.id)
    const isAdmin = payload.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    // Compute percentile among all reports for this assignment
    const [total, below, equal] = await Promise.all([
      Report.countDocuments({ assignmentId: report.assignmentId }),
      Report.countDocuments({ assignmentId: report.assignmentId, score: { $lt: report.score } }),
      Report.countDocuments({ assignmentId: report.assignmentId, score: report.score }),
    ])
    const percentile = total > 0 ? Math.round((((below + 0.5 * equal) / total) * 100)) : 0

    return NextResponse.json({
      id: String(report._id),
      studentId: report.studentId,
      assignmentId: report.assignmentId,
      score: report.score,
      totalQuestions: report.totalQuestions,
      correctAnswers: report.correctAnswers,
      category: report.category || null,
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
      recommendations: report.recommendations || [],
      analysis: { ...(report.analysis || {}), percentile },
      percentile,
      createdAt: report.createdAt,
    })
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Failed to fetch report' }, { status: 500 })
  }
}
