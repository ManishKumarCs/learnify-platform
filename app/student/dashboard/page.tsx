"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, BookOpen, Award, TrendingUp } from "lucide-react"
import Link from "next/link"

type ReportItem = { id: string; assignmentId: string; score: number; createdAt: string; percentile?: number }

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { icon: BookOpen, label: "Exams Taken", value: "—", color: "from-blue-100 to-blue-50" },
    { icon: Award, label: "Avg Score", value: "—", color: "from-green-100 to-green-50" },
    { icon: TrendingUp, label: "Predicted", value: "—", color: "from-purple-100 to-purple-50" },
    { icon: BarChart3, label: "Assigned", value: "—", color: "from-orange-100 to-orange-50" },
  ])
  const [recent, setRecent] = useState<ReportItem[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [repRes, perfRes, asgRes] = await Promise.all([
          fetch('/api/reports/list', { cache: 'no-store' }),
          fetch('/api/analytics/student/performance', { cache: 'no-store' }),
          fetch('/api/student/assignments', { cache: 'no-store' }),
        ])
        const rep = await repRes.json()
        const perf = await perfRes.json()
        const asg = await asgRes.json()
        const reports: ReportItem[] = (rep?.reports || []).map((r: any) => ({ id: r.id || r._id, assignmentId: r.assignmentId, score: r.score, createdAt: r.createdAt, percentile: r.percentile || r.analysis?.percentile }))
        setRecent(reports.slice(0, 5))
        const taken = reports.length
        const avg = taken ? Math.round(reports.reduce((s, r) => s + (r.score || 0), 0) / taken) : 0
        const assigned = Array.isArray(asg?.assignments) ? asg.assignments.length : 0
        const predicted = typeof perf?.predictedScore === 'number' ? Math.round(perf.predictedScore) : null
        setStats([
          { icon: BookOpen, label: 'Exams Taken', value: String(taken), color: 'from-blue-100 to-blue-50' },
          { icon: Award, label: 'Avg Score', value: taken ? `${avg}%` : '—', color: 'from-green-100 to-green-50' },
          { icon: TrendingUp, label: 'Predicted', value: predicted !== null ? `${predicted}%` : '—', color: 'from-purple-100 to-purple-50' },
          { icon: BarChart3, label: 'Assigned', value: String(assigned), color: 'from-orange-100 to-orange-50' },
        ])
      } catch {
        // leave defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-1">Track your progress and continue your learning journey.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className={`p-6 bg-gradient-to-br ${stat.color} border-0`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Icon size={24} className="text-blue-600" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Exams</h2>
            <Link href="/student/reports">
              <Button variant="outline" size="sm" className="bg-transparent">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recent.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-medium text-foreground">Assignment #{exam.assignmentId}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(exam.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">{exam.score}%</span>
                  {typeof exam.percentile === 'number' && (
                    <span className="text-xs font-medium text-muted-foreground">{exam.percentile}th percentile</span>
                  )}
                </div>
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-muted-foreground">No reports yet. Start an exam to see insights.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Next Steps</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Complete Your Profile</p>
              <p className="text-xs text-blue-700 mt-1">Add your academic background to get personalized recommendations.</p>
              <Link href="/student/profile">
                <Button size="sm" className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white">Complete Now</Button>
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
              <p className="text-sm font-medium text-cyan-900">Take a New Exam</p>
              <p className="text-xs text-cyan-700 mt-1">Challenge yourself with our latest exams.</p>
              <Link href="/student/exams">
                <Button size="sm" className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white">Browse Exams</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
