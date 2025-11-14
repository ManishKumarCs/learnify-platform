"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type ReviewItem = {
  index: number
  text: string
  options: string[]
  explanation?: string | null
  correctIndex: number | null
  selectedIndex: number | null
  wasCorrect: boolean
}

export default function ReportReviewPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}/answers`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data?.ok) throw new Error(data?.message || 'Failed to load review')
        setItems(data.questions || [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load review')
      } finally {
        setLoading(false)
      }
    }
    if (reportId) load()
  }, [reportId])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Couldn\'t load review</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.back()} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <ArrowLeft size={18} /> Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Review Questions</h1>
          <p className="text-muted-foreground mt-1">All questions with your answers and the correct ones</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((q) => (
          <Card key={q.index} className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Q{q.index}. {q.text}</p>
              {typeof q.selectedIndex === 'number' && typeof q.correctIndex === 'number' ? (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${q.selectedIndex === q.correctIndex ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {q.selectedIndex === q.correctIndex ? 'Correct' : 'Incorrect'}
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">Not answered</span>
              )}
            </div>
            <ul className="space-y-2">
              {q.options.map((opt, idx) => {
                const isSelected = q.selectedIndex === idx
                const isCorrect = q.correctIndex === idx
                return (
                  <li key={idx} className={`text-sm px-3 py-2 rounded-md border flex items-center justify-between ${isCorrect ? 'border-green-300 bg-green-50' : isSelected ? 'border-red-300 bg-red-50' : 'border-border'}`}>
                    <div>
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span className="text-foreground">{opt}</span>
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      {isCorrect && <span className="text-green-600">Correct</span>}
                      {isSelected && <span className={`${isCorrect ? 'text-green-700' : 'text-red-600'}`}>Your choice</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
            {q.explanation && (
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Explanation:</span> {q.explanation}
              </div>
            )}
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No questions to review.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
