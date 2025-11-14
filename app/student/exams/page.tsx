"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, BookOpen, ArrowRight, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface ExamData {
  id: string
  title: string
  description: string
  questions: number
  duration: number
  difficulty: string
  category: string
  taken: boolean
  reportId?: string | null
  deadline: string
  domain: "aptitude" | "reasoning" | "cs" | "dsa" | "quiz"
  topic: string
}

function domainPath(d: ExamData["domain"]) {
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

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [availableExams, setAvailableExams] = useState<ExamData[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/student/assignments", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load assignments")
        const items: ExamData[] = (data.assignments || []).map((a: any) => ({
          id: String(a.id),
          title: a.title,
          description: "Test your knowledge",
          questions: Number(a.limit) || 10,
          duration: 30,
          difficulty: "Medium",
          category: String(a.domain || "general").toUpperCase(),
          taken: Boolean(a.taken),
          reportId: a.reportId || null,
          deadline: a.dueAt ? String(a.dueAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          domain: a.domain,
          topic: a.topic,
        }))
        setAvailableExams(items)
      } catch (_) {
        setAvailableExams([])
      }
    }
    load()
  }, [])

  const filteredExams = availableExams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Available Exams</h1>
        <p className="text-muted-foreground mt-1">Choose an exam to test your knowledge and skills.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-blue-200"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam) => (
          <Card
            key={exam.id}
            className={`p-6 hover:shadow-lg transition-shadow border-blue-200 flex flex-col ${
              isDeadlinePassed(exam.deadline) ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{exam.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{exam.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {exam.taken && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                    Completed
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                  {exam.difficulty}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 flex-1">{exam.description}</p>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen size={16} />
                <span>{exam.questions} questions</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span>{exam.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span>Deadline: {new Date(exam.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {isDeadlinePassed(exam.deadline) ? (
              <Button disabled className="w-full bg-gray-400 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Deadline Passed
              </Button>
            ) : exam.taken ? (
              <Link href={`/student/reports/${exam.reportId ?? ''}`} className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  View Report
                </Button>
              </Link>
            ) : (
              <Link href={`/student/exam/${exam.id}`} className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 flex items-center justify-center gap-2">
                  Start Exam
                  <ArrowRight size={16} />
                </Button>
              </Link>
            )}
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No exams assigned to you yet.</p>
        </Card>
      )}
    </div>
  )
}
