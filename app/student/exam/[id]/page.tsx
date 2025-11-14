"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, CheckCircle, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

interface Question {
  text: string
  options: string[]
  explanation?: string
  correctIndex?: number
}

// Questions are fetched from backend per assignment

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(1800)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [deadlineExpired, setDeadlineExpired] = useState(false)
  const [started, setStarted] = useState(false)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60)
  const [questionTime, setQuestionTime] = useState(60)
  const [violations, setViolations] = useState(0)
  const [fullscreenActive, setFullscreenActive] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [startedAt, setStartedAt] = useState<string | undefined>(undefined)

  // Adaptive preview (difficulty mix and mastery) shown before starting
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const [preview, setPreview] = useState<{
    domain: string
    topic: string
    limit: number
    mastery: number
    predicted: number
    mix: { beginner: number; intermediate: number; advanced: number }
    targetCounts: { beginner: number; intermediate: number; advanced: number }
    availableCounts: { beginner: number; intermediate: number; advanced: number }
  } | null>(null)

  

  // Deadline is enforced by backend endpoint; optional client checks could be added here

  useEffect(() => {
    if (answers.length === 0) {
      setAnswers(new Array(questions.length).fill(null))
    }
  }, [questions.length])

  // Load preview as soon as page opens (before starting)
  useEffect(() => {
    const loadPrev = async () => {
      setPreviewError("")
      setPreviewLoading(true)
      try {
        const res = await fetch(`/api/student/assignments/${examId}/questions?preview=1`, { cache: 'no-store' })
        const data = await res.json()
        if (res.ok && data?.ok && data?.preview) {
          setPreview(data.preview)
        }
      } catch (e: any) {
        setPreviewError("Failed to load adaptive preview")
      } finally {
        setPreviewLoading(false)
      }
    }
    if (!started) loadPrev()
  }, [examId, started])

  useEffect(() => {
    if (!started) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 60) {
          setShowWarning(true)
        }
        if (prev <= 0) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started])

  useEffect(() => {
    if (!started) return
    setQuestionTimeLeft(questionTime)
    const qTimer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((x) => x + 1)
          } else {
            handleSubmit()
          }
          return questionTime
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(qTimer)
  }, [started, currentQuestion, questionTime, questions.length])

  useEffect(() => {
    if (!started) return
    const onVisibility = () => {
      if (document.hidden) setViolations((v) => v + 1)
    }
    const onFsChange = () => {
      const active = !!document.fullscreenElement
      setFullscreenActive(active)
      if (!active) setViolations((v) => v + 1)
    }
    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("fullscreenchange", onFsChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("fullscreenchange", onFsChange)
    }
  }, [started])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    return
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/student/assignments/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers,
          violations,
          startedAt,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to submit exam')

      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen()
        }
      } catch {}

      setSubmitted(true)
      setTimeout(() => {
        router.push(`/student/reports/${data.reportId}`)
      }, 800)
    } catch (error) {
      console.error("Error submitting exam:", error)
    } finally {
      setLoading(false)
    }
  }

  const startExam = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setFullscreenActive(true)
      }
    } catch {}
    // load questions for this assignment id
    setLoadingQuestions(true)
    setLoadError("")
    try {
      const res = await fetch(`/api/student/assignments/${examId}/questions`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        if (data?.code === 'ALREADY_COMPLETED') {
          toast("Exam already completed", { description: "Redirecting to your report..." })
          const reportId = data?.reportId
          setTimeout(() => {
            if (reportId) router.push(`/student/reports/${reportId}`)
            else router.push(`/student/reports`)
          }, 800)
          return
        }
        throw new Error(data.message || "Failed to load questions")
      }
      setQuestions(data.questions || [])
      setStarted(true)
      setStartedAt(new Date().toISOString())
    } catch (e: any) {
      setLoadError(e?.message || "Failed to load questions")
    } finally {
      setLoadingQuestions(false)
    }
  }

  if (deadlineExpired) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <Lock size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Exam Deadline Expired</h2>
          <p className="text-muted-foreground mb-6">
            The deadline for this exam has passed. You can no longer take this exam.
          </p>
          <Button onClick={() => router.push("/student/exams")} className="bg-blue-600 hover:bg-blue-700">
            Back to Exams
          </Button>
        </Card>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-xl w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">Adaptive Preview</h2>
          <div className="mb-6">
            {previewLoading && <p className="text-sm text-muted-foreground">Calculating personalized difficulty mix...</p>}
            {!previewLoading && preview && (
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Per-topic mastery</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{Math.round(preview.mastery)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Predicted score</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{Math.round(preview.predicted)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Question count</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{preview.limit}</p>
                </Card>
                <div className="md:col-span-3 grid gap-3 md:grid-cols-3">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-xs text-blue-900">Beginner</p>
                    <p className="text-lg font-semibold text-blue-900 mt-1">{Math.round(preview.mix.beginner * 100)}% ({preview.targetCounts.beginner})</p>
                    <p className="text-[10px] text-blue-800">Available: {preview.availableCounts.beginner}</p>
                  </Card>
                  <Card className="p-4 bg-amber-50 border-amber-200">
                    <p className="text-xs text-amber-900">Intermediate</p>
                    <p className="text-lg font-semibold text-amber-900 mt-1">{Math.round(preview.mix.intermediate * 100)}% ({preview.targetCounts.intermediate})</p>
                    <p className="text-[10px] text-amber-800">Available: {preview.availableCounts.intermediate}</p>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <p className="text-xs text-purple-900">Advanced</p>
                    <p className="text-lg font-semibold text-purple-900 mt-1">{Math.round(preview.mix.advanced * 100)}% ({preview.targetCounts.advanced})</p>
                    <p className="text-[10px] text-purple-800">Available: {preview.availableCounts.advanced}</p>
                  </Card>
                </div>
              </div>
            )}
            {!previewLoading && !preview && (
              <p className="text-sm text-muted-foreground">Personalized mix will be computed when you start.</p>
            )}
            {previewError && <p className="text-xs text-red-600 mt-2">{previewError}</p>}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">Exam Rules</h2>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6 list-disc pl-5">
            <li>Full screen is required during the exam.</li>
            <li>Only one question is shown at a time. You cannot go back.</li>
            <li>Each question has a time limit of {questionTime} seconds.</li>
            <li>Switching tabs or exiting full screen will be recorded.</li>
            <li>Total exam time still applies.</li>
          </ul>
          {loadError && <p className="text-sm text-red-600 mb-3">{loadError}</p>}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Potential violations: {violations}</div>
            <Button onClick={startExam} disabled={loadingQuestions} className="bg-blue-600 hover:bg-blue-700">{loadingQuestions ? "Loading..." : "Start Exam"}</Button>
          </div>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Exam Not Found</h2>
          <p className="text-muted-foreground mb-4">The exam you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/student/exams")} className="bg-blue-600 hover:bg-blue-700">
            Back to Exams
          </Button>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Exam Submitted!</h2>
          <p className="text-muted-foreground mb-4">
            Your exam has been submitted successfully. Generating your report...
          </p>
          <Loader2 size={24} className="mx-auto animate-spin text-blue-600" />
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const answeredCount = answers.filter((a) => a !== null).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam in Progress</h1>
          <p className="text-muted-foreground mt-1">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <Card className={`p-4 ${showWarning ? "border-red-500 bg-red-50" : "border-blue-200"}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={20} className={showWarning ? "text-red-600" : "text-blue-600"} />
              <div>
                <p className="text-xs text-muted-foreground">Time Remaining</p>
                <p className={`text-2xl font-bold ${showWarning ? "text-red-600" : "text-foreground"}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />
              <div>
                <p className="text-xs text-muted-foreground">Question Timer</p>
                <p className="text-xl font-semibold text-foreground">{formatTime(questionTimeLeft)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="p-8">
            <div className="mb-6">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">Question</span>
              <h2 className="text-2xl font-semibold text-foreground mt-4">{question.text}</h2>
            </div>

            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === idx
                      ? "border-blue-600 bg-blue-50"
                      : "border-border hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === idx ? "border-blue-600 bg-blue-600" : "border-border"
                      }`}
                    >
                      {answers[currentQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePrevious}
                disabled
                variant="outline"
                className="bg-transparent"
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Exam"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                >
                  Next
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-6">
            <h3 className="font-semibold text-foreground mb-4">Status</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Answered: {answeredCount} / {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">Fullscreen: {fullscreenActive ? "On" : "Off"}</p>
            <p className="text-xs text-muted-foreground">Violations: {violations}</p>
          </Card>
        </div>
      </div>
    </div>
  )

}
