"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, BookOpen, Award, TrendingUp } from "lucide-react"
import Link from "next/link"

type ReportItem = { id: string; assignmentId: string; score: number; createdAt: string; percentile?: number }
type PerfAnalytics = {
  predictedScore?: number
  passProbability?: number
  weakTopics?: { topic: string; domain?: string; accuracy: number; count: number }[]
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { icon: BookOpen, label: "Exams Taken", value: "—", color: "from-blue-100 to-blue-50" },
    { icon: Award, label: "Avg Score", value: "—", color: "from-green-100 to-green-50" },
    { icon: TrendingUp, label: "Predicted", value: "—", color: "from-purple-100 to-purple-50" },
    { icon: BarChart3, label: "Assigned", value: "—", color: "from-orange-100 to-orange-50" },
  ])
  const [recent, setRecent] = useState<ReportItem[]>([])
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [perfAnalytics, setPerfAnalytics] = useState<PerfAnalytics | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [repRes, perfRes, asgRes, profileRes] = await Promise.all([
          fetch('/api/reports/list', { cache: 'no-store' }),
          fetch('/api/analytics/student/performance', { cache: 'no-store' }),
          fetch('/api/student/assignments', { cache: 'no-store' }),
          fetch('/api/profile', { cache: 'no-store' }),
        ])
        const rep = await repRes.json()
        const perf = await perfRes.json()
        const asg = await asgRes.json()
        const profileData = profileRes.ok ? await profileRes.json() : null
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

        if (perf?.ok) {
          setPerfAnalytics({
            predictedScore: typeof perf.predictedScore === 'number' ? perf.predictedScore : undefined,
            passProbability: typeof perf.passProbability === 'number' ? perf.passProbability : undefined,
            weakTopics: Array.isArray(perf.weakTopics) ? perf.weakTopics : [],
          })
        }

        if (profileData) {
          const p = profileData.profile || {}
          const basicFilled = !!(profileData.firstName && profileData.lastName && profileData.email)
          const academicFilled = !!(p.academicBackground && p.collegeName && p.branch && p.course)
          setProfileCompleted(basicFilled && academicFilled)
        }
      } catch {
        // leave defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] items-stretch">
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white px-6 py-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide opacity-80 font-semibold">Hey Learner!</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">Welcome back to your practice space</h1>
              <p className="text-sm md:text-base mt-2 text-blue-100 max-w-xl">Track your exam performance, revisit reports, and keep improving with AI-powered insights.</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 text-sm text-blue-50">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                <span className="font-medium">You are on track</span>
              </span>
              <span className="opacity-90">Keep a streak of consistent practice every day.</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  className={`p-5 bg-gradient-to-br ${stat.color} border-0 rounded-2xl shadow-sm flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2 leading-tight">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-white/90 rounded-xl shadow-sm">
                      <Icon size={24} className="text-blue-600" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="p-5 rounded-2xl shadow-sm flex flex-col justify-between bg-white/80">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-3">Today&apos;s Snapshot</h2>
            <p className="text-sm text-slate-600 mb-4">Quick view of your activity and suggested actions for today.</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center justify-between">
                <span>Recent exam attempts</span>
                <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                  {recent.length || 0} today
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Average score</span>
                <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                  {stats[1]?.value}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Assigned exams</span>
                <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">
                  {stats[3]?.value}
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2 text-xs text-slate-500">
            <span>Tip: Review your last exam report before starting a new one.</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 rounded-2xl shadow-sm bg-white/90">
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

        <Card className="p-6 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-4">Next Steps</h2>
          <div className="space-y-3">
            {!profileCompleted && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Complete Your Profile</p>
                <p className="text-xs text-blue-700 mt-1">Add your academic background to get personalized recommendations.</p>
                <Link href="/student/profile">
                  <Button size="sm" className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white">Complete Now</Button>
                </Link>
              </div>
            )}

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

      {perfAnalytics && (
        <Card className="p-6 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-3">AI Performance Analytics</h2>
          <p className="text-xs text-muted-foreground mb-4">
            These insights are computed using lightweight machine learning on your past exam performance.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Predicted Next Score</p>
              <p className="text-2xl font-bold text-blue-700">
                {typeof perfAnalytics.predictedScore === 'number' ? `${Math.round(perfAnalytics.predictedScore)}%` : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pass Probability</p>
              <p className="text-2xl font-bold text-emerald-700">
                {typeof perfAnalytics.passProbability === 'number'
                  ? `${Math.round(perfAnalytics.passProbability * 100)}%`
                  : '—'}
              </p>
            </div>
            <div className="space-y-1 md:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Weak Topics</p>
              <ul className="space-y-1 text-xs text-slate-700">
                {perfAnalytics.weakTopics && perfAnalytics.weakTopics.length > 0 ? (
                  perfAnalytics.weakTopics.slice(0, 3).map((w, idx) => (
                    <li key={`${w.domain}:${w.topic}:${idx}`} className="flex items-center justify-between">
                      <span>{w.topic}</span>
                      <span className="text-red-600 font-semibold">{w.accuracy}%</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">Not enough data yet.</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
