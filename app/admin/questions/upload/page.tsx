"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Upload, Plus, X, Loader2 } from "lucide-react"

interface Question {
  id: string
  text: string
  type: "mcq" | "short-answer" | "essay"
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  options?: string[]
  correctAnswer?: number | string
  explanation: string
  exam: string
}

export default function UploadQuestionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "mcq",
    difficulty: "Medium",
    options: ["", "", "", ""],
  })

  const exams = ["Aptitude Test", "CS Concepts", "Programming Basics", "Problem Solving", "Data Structures"]
  const categories = ["Aptitude", "CS Concepts", "Programming", "Problem Solving", "Data Structures"]

  const handleAddQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.category || !currentQuestion.exam) {
      setError("Please fill all required fields")
      return
    }

    if (currentQuestion.type === "mcq" && (!currentQuestion.options || currentQuestion.correctAnswer === undefined)) {
      setError("Please add all options and select correct answer for MCQ")
      return
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      text: currentQuestion.text || "",
      type: currentQuestion.type as "mcq" | "short-answer" | "essay",
      category: currentQuestion.category || "",
      difficulty: currentQuestion.difficulty as "Easy" | "Medium" | "Hard",
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation || "",
      exam: currentQuestion.exam || "",
    }

    setQuestions([...questions, newQuestion])
    setCurrentQuestion({ type: "mcq", difficulty: "Medium", options: ["", "", "", ""] })
    setError("")
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])]
    newOptions[index] = value
    setCurrentQuestion({ ...currentQuestion, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (questions.length === 0) {
      setError("Please add at least one question")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questions),
      })
      if (!res.ok) throw new Error("Failed to upload")
      router.push("/admin/questions")
    } catch (err) {
      setError("Failed to upload questions. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Questions</h1>
        <p className="text-muted-foreground mt-1">Add questions to your question bank.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Question Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Add Question</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Question Text *</label>
              <textarea
                value={currentQuestion.text || ""}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                placeholder="Enter question text..."
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Question Type *</label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      type: e.target.value as "mcq" | "short-answer" | "essay",
                    })
                  }
                  className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                <select
                  value={currentQuestion.category || ""}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, category: e.target.value })}
                  className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Difficulty *</label>
                <select
                  value={currentQuestion.difficulty}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      difficulty: e.target.value as "Easy" | "Medium" | "Hard",
                    })
                  }
                  className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Exam *</label>
              <select
                value={currentQuestion.exam || ""}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, exam: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Exam</option>
                {exams.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {/* MCQ Options */}
            {currentQuestion.type === "mcq" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Options *</label>
                <div className="space-y-2">
                  {(currentQuestion.options || []).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={currentQuestion.correctAnswer === idx}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                        className="w-4 h-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 border-blue-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Explanation</label>
              <textarea
                value={currentQuestion.explanation || ""}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                placeholder="Explain the correct answer..."
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <Button
              type="button"
              onClick={handleAddQuestion}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Question
            </Button>
          </div>
        </Card>

        {/* Questions List */}
        {questions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Questions Added ({questions.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {idx + 1}. {q.text}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{q.type}</span>
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">{q.category}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            q.difficulty === "Easy"
                              ? "bg-green-100 text-green-700"
                              : q.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || questions.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} className="mr-2" />
                Upload {questions.length} Question(s)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
