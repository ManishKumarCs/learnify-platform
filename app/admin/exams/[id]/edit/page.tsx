"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"

interface ExamData {
  id: number
  title: string
  description: string
  duration: number
  totalQuestions: number
  deadline: string
  selectedStudents: string[]
  passingScore: number
}

export default function EditExamPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<ExamData | null>(null)

  const allStudents = [
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com" },
    { id: "4", name: "Sarah Williams", email: "sarah@example.com" },
    { id: "5", name: "Tom Brown", email: "tom@example.com" },
  ]

  useEffect(() => {
    const exams = JSON.parse(localStorage.getItem("exams") || "[]")
    const exam = exams.find((e: ExamData) => e.id === Number.parseInt(examId))
    if (exam) {
      setFormData(exam)
    } else {
      setError("Exam not found")
    }
  }, [examId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "duration" || name === "totalQuestions" || name === "passingScore"
                ? Number.parseInt(value)
                : value,
          }
        : null,
    )
  }

  const handleStudentToggle = (studentId: string) => {
    if (!formData) return
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            selectedStudents: prev.selectedStudents.includes(studentId)
              ? prev.selectedStudents.filter((id) => id !== studentId)
              : [...prev.selectedStudents, studentId],
          }
        : null,
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const exams = JSON.parse(localStorage.getItem("exams") || "[]")
      const index = exams.findIndex((e: ExamData) => e.id === formData.id)
      if (index !== -1) {
        exams[index] = formData
        localStorage.setItem("exams", JSON.stringify(exams))
      }

      router.push("/admin/exams")
    } catch (err) {
      setError("Failed to update exam. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!formData) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Exam Not Found</h2>
          <Button onClick={() => router.push("/admin/exams")} className="mt-4 bg-blue-600">
            Back to Exams
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Exam</h1>
        <p className="text-muted-foreground mt-1">Update exam details and student assignments.</p>
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

        {/* Exam Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Exam Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Exam Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="border-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="5"
                  max="300"
                  className="border-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Total Questions</label>
                <Input
                  type="number"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleInputChange}
                  min="1"
                  className="border-blue-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deadline</label>
                <Input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="border-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Passing Score (%)</label>
                <Input
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="border-blue-200"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Student Assignment */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Assign Students</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allStudents.map((student) => (
              <label key={student.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                  className="w-4 h-4 rounded border-blue-300 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Exam"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
