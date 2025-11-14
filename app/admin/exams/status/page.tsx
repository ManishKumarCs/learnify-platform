"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Eye, Mail } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type Row = {
  studentId: string
  studentName: string
  studentEmail: string
  status: "pending" | "completed" | "expired"
  score?: number
  total?: number
  submittedAt?: string
}

export default function ExamStatusPage() {
  const sp = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [meta, setMeta] = useState<{ domain: string; topic: string; limit: number; dueAt?: string } | null>(null)
  const [stats, setStats] = useState<{ completed: number; pending: number; expired: number; total: number } | null>(null)

  const id = sp.get('id') || ''

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "expired":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/admin/assignments/${encodeURIComponent(id)}/status`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to load')
        setRows(data.students || [])
        setTitle(data.assignment?.title || '')
        setMeta({ domain: data.assignment?.domain, topic: data.assignment?.topic, limit: data.assignment?.limit, dueAt: data.assignment?.dueAt })
        setStats(data.stats || null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const filtered = useMemo(() => rows.filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase())), [rows, searchTerm])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Exam Status</h1>
        <p className="text-muted-foreground mt-1">Track student exam completion and status.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-lg font-semibold text-foreground">{title}</p>
            {meta && (
              <p className="text-xs text-muted-foreground mt-1">{meta.domain?.toUpperCase()} • {meta.topic} • {meta.limit} questions • Due: {meta.dueAt ? new Date(meta.dueAt).toLocaleDateString() : '—'}</p>
            )}
          </div>
          <div className="relative md:max-w-sm w-full">
            <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
            <Input placeholder="Search by student..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10 border-blue-200" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground mb-2">Loading...</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Submitted At</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-foreground">{item.studentName}</p>
                      <p className="text-xs text-muted-foreground">{item.studentEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground">{typeof item.score === 'number' && typeof item.total === 'number' ? `${item.score}/${item.total}` : '—'}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && (
                        <Link href={`/admin/students/${item.studentId}`}>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Eye size={18} className="text-blue-600" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No records.</p>
          </div>
        )}
      </Card>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Expired</p>
            <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
