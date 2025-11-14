"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Users, BookOpen, TrendingUp, Activity } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totals, setTotals] = useState<{ totalStudents: number; examsCompleted: number; avgScore: number; activeUsers: number } | null>(null)
  const [studentGrowth, setStudentGrowth] = useState<any[]>([])
  const [examStats, setExamStats] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/admin/overview', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data?.message || 'Failed to load analytics')
        setTotals(data.totals)
        setStudentGrowth(data.studentGrowth || [])
        setExamStats(data.examStats || [])
        setPerformanceData(data.performanceData || [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground mt-2">Monitor platform performance and student engagement.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Students</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totals?.totalStudents ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">Live</p>
            </div>
            <Users size={32} className="text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Exams Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totals?.examsCompleted ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">Live</p>
            </div>
            <BookOpen size={32} className="text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Avg Score</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totals?.avgScore ?? '—'}%</p>
              <p className="text-xs text-muted-foreground mt-1">Live</p>
            </div>
            <TrendingUp size={32} className="text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Users</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{totals?.activeUsers ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </div>
            <Activity size={32} className="text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="growth">Student Growth</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="exams">Exam Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Student Growth Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studentGrowth}>
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
                <Legend />
                <Line type="monotone" dataKey="students" stroke="var(--chart-1)" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="active" stroke="var(--chart-2)" strokeWidth={2} name="Active" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Student Performance Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
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
                <Bar dataKey="students" fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Exam Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={examStats} cx="50%" cy="50%" labelLine={false} label outerRadius={80} dataKey="value">
                  {examStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {examStats.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                    <span className="text-muted-foreground">{stat.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
