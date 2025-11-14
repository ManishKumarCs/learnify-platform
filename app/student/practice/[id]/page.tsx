"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: string
  category: string
  topic: string
}

export default function PracticeSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load practice questions
    const mockQuestions: Question[] = [
      {
        id: "1",
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1,
        explanation: "Binary search divides the search space in half each time, resulting in O(log n) time complexity.",
        difficulty: "medium",
        category: "Algorithms",
        topic: "Data Structures",
      },
      {
        id: "2",
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: 1,
        explanation:
          "Stack uses Last In First Out (LIFO) principle where the last element added is the first to be removed.",
        difficulty: "easy",
        category: "Data Structures",
        topic: "Data Structures",
      },
      {
        id: "3",
        question: "What is the space complexity of merge sort?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 2,
        explanation: "Merge sort requires O(n) additional space for merging the sorted subarrays.",
        difficulty: "hard",
        category: "Algorithms",
        topic: "Algorithms",
      },
    ]

    setQuestions(mockQuestions)
    setSelectedAnswers(new Array(mockQuestions.length).fill(null))
    setLoading(false)
  }, [sessionId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          setSessionComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Questions Available</h2>
          <p className="text-muted-foreground mb-4">This practice session has no questions.</p>
          <Button onClick={() => router.push("/student/practice")} className="bg-blue-600 hover:bg-blue-700">
            Back to Practice
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = selectedAnswers[currentQuestionIndex] !== null
  const isCorrect = selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (optionIndex: number) => {
    if (!sessionComplete) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestionIndex] = optionIndex
      setSelectedAnswers(newAnswers)
      setShowExplanation(true)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    } else {
      setSessionComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  if (sessionComplete) {
    const correctCount = selectedAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length
    const score = Math.round((correctCount / questions.length) * 100)

    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Practice Session Complete</h1>
          <p className="text-muted-foreground">Great job! Here's your performance summary.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <p className="text-sm text-muted-foreground font-medium">Your Score</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{score}%</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0">
            <p className="text-sm text-muted-foreground font-medium">Correct Answers</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {correctCount}/{questions.length}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <p className="text-sm text-muted-foreground font-medium">Time Taken</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{formatTime(30 * 60 - timeRemaining)}</p>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => router.push("/student/practice")} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Back to Practice
          </Button>
          <Button onClick={() => router.push("/student/dashboard")} className="flex-1 bg-gray-600 hover:bg-gray-700">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Practice Session</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
          <Clock size={20} />
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">{currentQuestion.question}</h2>

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              disabled={sessionComplete}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestionIndex] === idx
                  ? isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-blue-300"
              } ${sessionComplete ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{option}</span>
                {selectedAnswers[currentQuestionIndex] === idx && (
                  <div className={isCorrect ? "text-green-600" : "text-red-600"}>
                    {isCorrect ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-2">Explanation:</p>
            <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
            <ArrowRight size={18} />
          </Button>
        </div>
      </Card>
    </div>
  )
}
