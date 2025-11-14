"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import Link from "next/link"

type ReportListItem = {
  id: string
  assignmentId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  category?: string | null
  createdAt?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/reports/list`, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to load reports")
        setReports(data.reports || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
        <p className="text-muted-foreground mt-1">View detailed analysis of your exam performance.</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading reports...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">Assignment #{report.assignmentId}</h3>
                  {report.category && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {report.category}
                    </span>
                  )}
                </div>
                {report.createdAt && (
                  <p className="text-sm text-muted-foreground mb-3">{new Date(report.createdAt).toLocaleString()}</p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Summary</p>
                    <div className="text-sm text-muted-foreground">
                      Correct {report.correctAnswers} / {report.totalQuestions}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{report.score}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Your Score</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/student/reports/${report.id}`}>
                    <Button variant="outline" size="sm" className="bg-transparent flex items-center gap-2">
                      <Eye size={16} />
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
