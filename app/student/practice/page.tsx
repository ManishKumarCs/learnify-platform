"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function PracticePage() {
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/practice/sections', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data?.ok) throw new Error(data?.message || 'Failed to load sections')
        setSections(data.sections || [])
      } catch {
        setSections([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice sections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Practice Dashboard</h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl">
          Choose a section and attempt focused quizzes to improve your speed and accuracy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 rounded-2xl shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Total Sections</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">{sections.length}</p>
        </Card>
        <Card className="p-4 rounded-2xl shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 border-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Question Type</p>
          <p className="mt-2 text-sm font-medium text-emerald-900">MCQ · Timed practice</p>
        </Card>
        <Card className="p-4 rounded-2xl shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 border-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Recommended</p>
          <p className="mt-2 text-sm font-medium text-amber-900">Start with weaker topics first</p>
        </Card>
        <Card className="p-4 rounded-2xl shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 border-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Mode</p>
          <p className="mt-2 text-sm font-medium text-indigo-900">Exam-like environment</p>
        </Card>
      </div>

      <Card className="p-0 rounded-2xl shadow-sm bg-white/90 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Available Practice Sections</h2>
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Open for practice
            </span>
          </div>
        </div>

        <div className="min-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Section Name</th>
                <th className="px-6 py-3 text-left">Questions</th>
                <th className="px-6 py-3 text-left">Mode</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, index) => (
                <tr key={sec} className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 text-slate-500 text-xs font-medium">{index + 1}</td>
                  <td className="px-6 py-3 text-slate-900 font-medium flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <BookOpen size={18} />
                    </span>
                    {sec}
                  </td>
                  <td className="px-6 py-3 text-slate-700">10 MCQs</td>
                  <td className="px-6 py-3 text-slate-700">Timed · ~15–20 mins</td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/student/practice/section/${encodeURIComponent(sec)}`}>
                      <Button size="sm" className="rounded-full px-4 bg-blue-600 hover:bg-blue-700">
                        Start
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {sections.length === 0 && (
        <Card className="p-8 text-center rounded-2xl shadow-sm bg-white/90">
          <p className="text-muted-foreground">No practice sections available.</p>
        </Card>
      )}
    </div>
  )
}
