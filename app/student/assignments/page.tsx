"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

type Assignment = {
  id: string
  title: string
  domain: "aptitude" | "reasoning" | "cs" | "dsa" | "quiz"
  topic: string
  limit: number
  dueAt?: string
  createdAt: string
}

function domainPath(d: Assignment["domain"]) {
  switch (d) {
    case "aptitude":
      return "/student/practice/aptitude"
    case "reasoning":
      return "/student/practice/reasoning"
    case "cs":
      return "/student/practice/cs"
    case "dsa":
      return "/student/practice/dsa"
    default:
      return "/student/practice/aptitude"
  }
}

export default function StudentAssignmentsPage() {
  const [items, setItems] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/student/assignments", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load assignments")
        setItems(data.assignments || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load assignments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
        <p className="text-muted-foreground mt-1">Tests assigned by your instructor</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => {
          const href = `${domainPath(a.domain)}?topic=${encodeURIComponent(a.topic)}&limit=${a.limit}`
          return (
            <Card key={a.id} className="p-5 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.domain.toUpperCase()} • Topic: {a.topic} • {a.limit} Q
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {a.dueAt ? new Date(a.dueAt).toLocaleString() : "No due date"}
                  </p>
                </div>
                <Link
                  href={href}
                  className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Start
                </Link>
              </div>
            </Card>
          )
        })}
        {items.length === 0 && !loading && (
          <Card className="p-8 text-center text-sm text-muted-foreground">No assignments yet.</Card>
        )}
      </div>
    </div>
  )
}
