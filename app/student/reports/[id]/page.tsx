"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Download, ArrowLeft, Lightbulb, TrendingUp, ListChecks } from "lucide-react"

type Report = {
  id: string
  assignmentId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  category?: string | null
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  analysis?: Record<string, any>
}

type ReviewItem = {
  index: number
  text: string
  options: string[]
  explanation?: string | null
  correctIndex: number | null
  selectedIndex: number | null
  wasCorrect: boolean
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to load report")
        setReport(data)
      } catch (e: any) {
        setError(e?.message || "Failed to load report")
      } finally {
        setLoading(false)
      }
    }
    if (reportId) load()
  }, [reportId])

  function performanceComment(score: number) {
    if (score >= 85) return 'Excellent performance'
    if (score >= 70) return 'Good job — keep improving'
    if (score >= 50) return 'Needs improvement — focus on weak areas'
    return 'Significant improvement needed — revisit fundamentals'
  }

  function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"], v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your result...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="p-8 text-center rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "The report you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/student/reports")} className="bg-blue-600 hover:bg-blue-700">
            Back to Reports
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <Card className="p-5 md:p-6 rounded-2xl shadow-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white mb-3 font-medium"
            >
              <ArrowLeft size={18} />
              Back to reports
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Assignment #{report.assignmentId}</h1>
            <p className="text-sm md:text-base text-blue-100 mt-1">Detailed performance analysis and AI-powered insights.</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <span className="font-medium">{performanceComment(report.score)}</span>
            </span>
            <div className="flex gap-3 text-xs text-blue-100">
              <span>Total Questions: {report.totalQuestions}</span>
              <span>|</span>
              <span>Correct: {report.correctAnswers}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <Button
                size="sm"
                onClick={() => router.push(`/student/reports/${reportId}/review`)}
                className="bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-2 rounded-full px-4 py-1 h-8"
              >
                <ListChecks size={16} />
                Review Questions
              </Button>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 rounded-full px-4 py-1 h-8"
              >
                <Download size={16} />
                Download
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0 rounded-2xl shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Your Score</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{report.score}%</p>
          <p className="text-xs text-muted-foreground mt-2">{performanceComment(report.score)}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0 rounded-2xl shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Correct Answers</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{report.correctAnswers}/{report.totalQuestions}</p>
          <p className="text-xs text-muted-foreground mt-2">Questions Answered</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0 rounded-2xl shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Category</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{report.category || '—'}</p>
          <p className="text-xs text-muted-foreground mt-2">Exam Type</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-0 rounded-2xl shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Percentile</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">{typeof (report as any).percentile === 'number' ? ordinal((report as any).percentile) : (typeof (report as any).analysis?.percentile === 'number' ? ordinal((report as any).analysis.percentile) : '—')}</p>
          <p className="text-xs text-muted-foreground mt-2">Among All Students</p>
        </Card>
      </div>

      {/* ML Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 border-blue-200 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-2">Predictions</h2>
          <p className="text-sm text-muted-foreground">Predicted Next Score</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {typeof report.analysis?.predictedScore === 'number' ? Math.round(report.analysis.predictedScore) : '—'}%
          </p>
          <p className="text-sm text-muted-foreground mt-3">Pass Probability</p>
          <p className="text-2xl font-semibold text-green-600">
            {typeof report.analysis?.passProbability === 'number' ? `${Math.round(report.analysis.passProbability * 100)}%` : '—'}
          </p>
        </Card>

        <Card className="p-6 border-amber-200 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-4">Weak Topics</h2>
          <ul className="space-y-2">
            {(report.analysis?.weakTopics as any[] | undefined)?.slice(0,6).map((w, idx) => (
              <li key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{w.domain}:{w.topic}</span>
                <span className="font-medium text-red-600">{w.accuracy}%</span>
              </li>
            )) || <li className="text-sm text-muted-foreground">No weak topics detected</li>}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-4">Category Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(report.analysis?.categoryScores as any[]) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="score" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Skills Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={(report.analysis?.radarData as any[]) || []}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="category" stroke="var(--muted-foreground)" />
              <PolarRadiusAxis stroke="var(--muted-foreground)" />
              <Radar name="Score" dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 border-green-200 rounded-2xl shadow-sm bg-white/90">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-foreground">Your Strengths</h2>
          </div>
          <ul className="space-y-3">
            {report.strengths.map((strength: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 border-orange-200 rounded-2xl shadow-sm bg-white/90">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-orange-600" />
            <h2 className="text-lg font-semibold text-foreground">Areas to Improve</h2>
          </div>
          <ul className="space-y-3">
            {report.weaknesses.map((weakness: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Personalized Recommendations</h2>
        <div className="space-y-3">
          {report.recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <span className="text-muted-foreground">{rec}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
