"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Topic = { key: string; label: string }

type AptitudeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
}

export default function AptitudePracticePage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selected, setSelected] = useState<string>("random")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([])

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await fetch("/api/aptitude/topics", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setTopics(data.topics || [])
      } catch {
        // ignore
      }
    }
    loadTopics()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/aptitude/getQuestions?topic=${encodeURIComponent(selected)}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load questions")
      setQuestions(data.questions || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Aptitude Practice</h1>
        <p className="text-muted-foreground mt-2">Choose a topic and practice aptitude questions.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchQuestions} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Loading..." : "Load Questions"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>

      {questions.length > 0 && (
        <Card className="p-6 space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="border-b last:border-b-0 pb-4">
              <p className="font-medium text-foreground">{idx + 1}. {q.question}</p>
              <ul className="mt-2 grid gap-2">
                {q.options?.map((opt, i) => (
                  <li key={i} className="px-3 py-2 rounded border border-blue-200">{opt}</li>
                ))}
              </ul>
              {q.explanation && (
                <p className="text-sm text-muted-foreground mt-2">Explanation: {q.explanation}</p>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
