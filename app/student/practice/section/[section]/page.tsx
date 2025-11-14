"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowRight, Clock, AlertCircle } from "lucide-react"

interface Q {
  text: string
  options: string[]
  correctIndex?: number
  explanation?: string
  subtopic?: string
}

export default function PracticeSectionPage() {
  const params = useParams()
  const router = useRouter()
  const section = decodeURIComponent(params.section as string)

  const [questions, setQuestions] = useState<Q[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startedAt, setStartedAt] = useState<string>("")
  const [idx, setIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20 * 60) // 20 mins
  const current = questions[idx]

  useEffect(() => {
    const load = async () => {
      try {
        // fullscreen attempt
        try {
          await document.documentElement.requestFullscreen()
        } catch {}
        setStartedAt(new Date().toISOString())
        const res = await fetch(`/api/practice/${encodeURIComponent(section)}/questions`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data?.ok) throw new Error(data?.message || 'Failed to load questions')
        setQuestions(data.questions || [])
        setAnswers(new Array((data.questions || []).length).fill(null))
      } catch (e: any) {
        toast("Failed to load practice", { description: e?.message || 'Unable to fetch questions' })
      } finally {
        setLoading(false)
      }
    }
    if (section) load()
  }, [section])

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(v => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const format = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  const select = (i: number) => {
    const copy = [...answers]
    copy[idx] = i
    setAnswers(copy)
  }

  const next = () => setIdx(i => Math.min(i + 1, questions.length - 1))
  const prev = () => setIdx(i => Math.max(i - 1, 0))

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/practice/${encodeURIComponent(section)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, startedAt }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.message || 'Submit failed')
      toast("Practice submitted", { description: `Score: ${data.score}%` })
      try { await document.exitFullscreen?.() } catch {}
      router.push(`/student/reports/${data.reportId}`)
    } catch (e: any) {
      toast("Submit failed", { description: e?.message || 'Please try again' })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice...</p>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No questions available</h2>
          <p className="text-muted-foreground mb-4">Please choose another section.</p>
          <Button onClick={() => router.push('/student/practice')} className="bg-blue-600 hover:bg-blue-700">Back to Practice</Button>
        </Card>
      </div>
    )
  }

  const answered = answers[idx] !== null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{section}</h1>
          <p className="text-muted-foreground">Question {idx + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
          <Clock size={18} /> {format(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((idx+1)/questions.length)*100}%` }}></div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{current.text}</h2>
        <div className="space-y-3">
          {current.options.map((opt, i) => {
            const selected = answers[idx] === i
            return (
              <button key={i} onClick={() => select(i)} className={`w-full p-4 text-left rounded-lg border transition ${selected ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-blue-300'}`}>
                <span className="font-medium">{String.fromCharCode(65+i)}. {opt}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={prev} disabled={idx===0} className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50">Previous</Button>
        {idx < questions.length - 1 ? (
          <Button onClick={next} disabled={!answered} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">Next <ArrowRight size={16} /></Button>
        ) : (
          <Button onClick={submit} disabled={submitting} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">Submit</Button>
        )}
      </div>

      {timeLeft === 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={18} /> Time is up. Please submit your answers.
        </div>
      )}
    </div>
  )
}
