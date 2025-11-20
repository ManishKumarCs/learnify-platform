"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, FileText, TrendingUp, Award } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboard() {
  const { data, error, isLoading } = useSWR("/api/analytics/admin/overview", fetcher)
  const { data: anomData } = useSWR("/api/analytics/admin/anomalies", fetcher)
  const totals = data?.totals || {}
  const growth = data?.studentGrowth || []
  const performance = data?.performanceData || []
  const recent = data?.recentActivity || []
  const readiness = data?.readinessDistribution || []
  const atRisk = data?.topAtRisk || []
  const anomalies = anomData?.anomalies || []

  const dashboardStats = [
    { icon: Users, label: "Total Students", value: totals.totalStudents ?? "-", change: "" },
    { icon: FileText, label: "Active Exams", value: totals.activeExams ?? "-", change: "" },
    { icon: TrendingUp, label: "Avg Score", value: typeof totals.avgScore === 'number' ? `${totals.avgScore}%` : "-", change: "" },
    { icon: Award, label: "Completions", value: totals.examsCompleted ?? "-", change: "" },
  ]

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <Card className="p-5 md:p-6 rounded-2xl shadow-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Analytics Dashboard</h1>
            <p className="text-sm md:text-base text-blue-100 mt-1">Monitor student activity, exam performance, and anomalies in real time.</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <span className="font-medium">Platform healthy</span>
            </span>
            <div className="flex gap-3 text-xs text-blue-100">
              <span>Students: {totals.totalStudents ?? '-'}</span>
              <span>|</span>
              <span>Active exams: {totals.activeExams ?? '-'}</span>
            </div>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-4 w-4 border-2 border-blue-600 border-b-transparent rounded-full animate-spin" />
          Loading analytics...
        </div>
      )}
      {error && <p className="text-sm text-red-500">Failed to load analytics</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  {totals.activeUsers !== undefined && stat.label === 'Total Students' && (
                    <p className="text-xs text-emerald-600 font-medium mt-2">Active users: {totals.activeUsers}</p>
                  )}
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Icon size={22} className="text-blue-600" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-4">Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="var(--chart-1)" strokeWidth={2} name="Students" />
              <Line type="monotone" dataKey="active" stroke="var(--chart-2)" strokeWidth={2} name="Active (est)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-4">Category Performance</h2>
          <div className="space-y-4">
            {performance.map((item: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.range || item.name}</span>
                  <span className="text-sm font-bold text-blue-600">{(item.students ?? item.score) as number}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Number(item.score ?? (item.students ?? 0))) }%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 rounded-2xl shadow-sm bg-white/90">
          <h2 className="text-lg font-semibold text-foreground mb-4">Readiness Distribution</h2>
          <div className="space-y-4">
            {readiness.map((r: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{r.band}</span>
                  <span className="text-sm font-bold" style={{ color: r.color }}>{r.students}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, r.students || 0)}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            ))}
            {readiness.length === 0 && <p className="text-sm text-muted-foreground">No readiness data yet.</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top At-Risk Students</h2>
          <div className="space-y-3">
            {atRisk.map((u: any, idx: number) => (
              <Link key={idx} href={`/admin/students/${encodeURIComponent(u.userId)}`}>
                <div className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/70 transition-colors cursor-pointer">
                  <div className="text-sm text-foreground">{u.userId}</div>
                  <div className="text-xs font-semibold text-red-600">{Math.round((u.probability || 0) * 100)}% pass probability</div>
                </div>
              </Link>
            ))}
            {atRisk.length === 0 && <p className="text-sm text-muted-foreground">No at-risk students identified.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recent.map((activity: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{activity.user}</p>
                <p className="text-xs text-muted-foreground">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time ? new Date(activity.time).toLocaleString() : '-'}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Anomalies</h2>
        <div className="space-y-3">
          {anomalies.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-3 border border-border rounded-md">
              <div className="text-sm text-foreground">
                <div className="font-medium">Attempt {a.id}</div>
                <div className="text-xs text-muted-foreground">User: {a.userId} • Assignment: {a.assignmentId}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-red-600">Risk: {(a.risk*100).toFixed(0)}%</span>
                <span className="text-xs text-muted-foreground">Violations: {a.violations}</span>
                <span className="text-xs text-muted-foreground">Avg time: {a.meanAnswerTime ? `${a.meanAnswerTime.toFixed(1)}s` : '—'}</span>
              </div>
            </div>
          ))}
          {anomalies.length === 0 && <p className="text-sm text-muted-foreground">No anomalies detected recently.</p>}
        </div>
      </Card>
    </div>
  )
}
