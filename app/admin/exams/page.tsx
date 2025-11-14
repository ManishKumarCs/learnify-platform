"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Mail } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"

type AssignmentRow = {
  id: string
  title: string
  domain: "aptitude" | "reasoning" | "cs" | "dsa" | "quiz"
  topic: string
  limit: number
  assignedTo: string[]
  dueAt?: string
  status: string
  createdAt: string
}

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/assignments", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load assignments")
      setRows(data.assignments || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => rows.filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase())), [rows, searchTerm])

  const getStatus = (due?: string) => {
    if (!due) return "Active"
    const now = new Date()
    const dd = new Date(due)
    return dd < now ? "Expired" : "Active"
  }

  const handleRemind = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/assignments/${encodeURIComponent(id)}/remind`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to send reminders')
      alert(`Reminder emails queued: ${data.sent} sent${data.failed?.length ? `, ${data.failed.length} failed` : ''}`)
    } catch (e: any) {
      alert(e?.message || 'Failed to send reminders')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exams</h1>
        <p className="text-muted-foreground mt-1">Create and manage exams (assignments) for students.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative flex-1 md:max-w-sm">
            <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200"
            />
          </div>
          <Link href="/admin/exams/create">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 flex items-center gap-2">
              <Plus size={18} />
              Create Exam
            </Button>
          </Link>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground mb-4">Loading...</p>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <Card key={exam.id} className="p-4 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{exam.domain.toUpperCase()} • {exam.topic} • {exam.limit} questions</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    getStatus(exam.dueAt) === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {getStatus(exam.dueAt)}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-medium text-foreground">{exam.assignedTo.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due:</span>
                  <span className="font-medium text-foreground text-xs">{exam.dueAt ? new Date(exam.dueAt).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium text-foreground text-xs">{new Date(exam.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Link href={`/admin/exams/status?id=${encodeURIComponent(exam.id)}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2 bg-transparent"
                  >
                    View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemind(exam.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-transparent"
                >
                  <Mail size={16} />
                  Remind
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exams found. Create one to get started!</p>
          </div>
        )}
      </Card>
    </div>
  )
}
