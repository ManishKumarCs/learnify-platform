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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice sections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI-Powered Practice</h1>
        <p className="text-muted-foreground mt-2">Choose a section to practice 10 MCQs in an exam-like experience.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec) => (
          <Card key={sec} className="p-6 border-blue-200 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Practice Section</p>
                <h3 className="text-lg font-semibold text-foreground mt-1">{sec}</h3>
              </div>
              <BookOpen size={28} className="text-blue-600 opacity-70" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">10 MCQs · ~15–20 mins</p>
            <div className="mt-4">
              <Link href={`/student/practice/section/${encodeURIComponent(sec)}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Practice</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {sections.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No practice sections available.</p>
        </Card>
      )}
    </div>
  )
}
