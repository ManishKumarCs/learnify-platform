"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Topic = { key: string; label: string }

type PracticeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
}

export default function DSAPracticePage() {
  const searchParams = useSearchParams()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selected, setSelected] = useState<string>("random")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [limit, setLimit] = useState<number>(10)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number } | null>(null)

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await fetch("/api/dsa/topics", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setTopics(data.topics || [])
      } catch {}
    }
    loadTopics()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/dsa/getQuestions?topic=${encodeURIComponent(selected)}&limit=${limit}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load questions")
      setQuestions(data.questions || [])
      setAnswers({})
    } catch (e: any) {
      setError(e?.message || "Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  // Auto-load by query
  useEffect(() => {
    const t = searchParams.get('topic')
    const l = searchParams.get('limit')
    if (t) setSelected(t)
    if (l) setLimit(Math.max(1, Math.min(Number(l), 50)))
    if (t || l) setTimeout(fetchQuestions, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSelect = (qIdx: number, opt: string) => setAnswers((prev) => ({ ...prev, [qIdx]: opt }))
  const canSubmit = useMemo(() => questions.length > 0 && Object.keys(answers).length === questions.length, [questions, answers])

  const submitAttempt = async () => {
    setSubmitting(true)
    setError("")
    try {
      const payload = {
        topic: selected,
        totalTime: 0,
        answers: questions.map((q, i) => ({ question: q.question, selected: answers[i] || "", timeTaken: 0 })),
      }
      const res = await fetch('/api/dsa/submitAttempt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to submit')
      setResult({ score: data.score, total: data.total })
    } catch (e: any) {
      setError(e?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">DSA Practice</h1>
        <p className="text-muted-foreground mt-2">Choose a topic and practice data structures & algorithms questions.</p>
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
          <div className="mt-3">
            <label className="block text-sm font-medium text-foreground mb-2">Limit</label>
            <input type="number" min={1} max={50} value={limit} onChange={(e)=>setLimit(Math.max(1, Math.min(Number(e.target.value||10),50)))} className="w-28 p-2 border rounded border-blue-200" />
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
              <ul className="mt-3 grid gap-2">
                {q.options?.map((opt, i) => {
                  const selectedOpt = answers[idx]
                  const active = selectedOpt === opt
                  return (
                    <li key={i}>
                      <button type="button" onClick={() => onSelect(idx, opt)} className={`w-full text-left px-3 py-2 rounded border ${active ? 'border-blue-600 bg-blue-50' : 'border-blue-200 hover:bg-muted'}`}>
                        <span className="mr-2">{active ? '●' : '○'}</span>{opt}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {result && (
                <div className="mt-2 text-sm">
                  {answers[idx] === q.answer ? (
                    <span className="text-green-600">Correct</span>
                  ) : (
                    <span className="text-red-600">Wrong</span>
                  )}
                  <span className="text-muted-foreground ml-3">Correct answer: {q.answer}</span>
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={submitAttempt} disabled={!canSubmit || submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? 'Submitting...' : 'Submit' }
            </Button>
            {result && (
              <span className="text-sm text-foreground">Score: {result.score} / {result.total} ({result.total? Math.round((result.score/result.total)*100):0}%)</span>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
