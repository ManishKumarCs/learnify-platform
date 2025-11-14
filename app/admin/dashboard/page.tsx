"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your platform overview.</p>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load analytics</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  {totals.activeUsers !== undefined && stat.label === 'Total Students' && (
                    <p className="text-xs text-green-600 font-medium mt-2">Active users: {totals.activeUsers}</p>
                  )}
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                  <Icon size={24} className="text-blue-600" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
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

        <Card className="p-6">
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
        <Card className="p-6">
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
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="text-sm text-foreground">{u.userId}</div>
                <div className="text-xs font-semibold text-red-600">{Math.round((u.probability || 0) * 100)}% pass probability</div>
              </div>
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
