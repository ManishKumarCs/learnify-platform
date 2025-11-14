"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"

interface ExamFormData {
  title: string
  description: string
  duration: number
  totalQuestions: number
  deadline: string
  selectedStudents: string[]
  passingScore: number
}

export default function CreateExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [students, setStudents] = useState<{ id: string; name: string; email: string }[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [domain, setDomain] = useState<"aptitude" | "reasoning" | "cs" | "dsa">("aptitude")
  const [topics, setTopics] = useState<{ key: string; label: string }[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("random")
  const [formData, setFormData] = useState<ExamFormData>({
    title: "",
    description: "",
    duration: 60,
    totalQuestions: 0,
    deadline: "",
    selectedStudents: [],
    passingScore: 40,
  })

  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true)
      try {
        const res = await fetch("/api/admin/students", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load students")
        const rows = (data.students || []).map((s: any) => ({ id: s.id, name: s.name, email: s.email }))
        setStudents(rows)
      } catch (e: any) {
        setError(e?.message || "Failed to load students")
      } finally {
        setLoadingStudents(false)
      }
    }
    loadStudents()
  }, [])

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await fetch(`/api/${domain}/topics`, { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || "Failed to load topics")
        setTopics(data.topics || [])
        // keep selection if exists in new list; else default to 'random'
        const exists = (data.topics || []).some((t: any) => t.key === selectedTopic)
        setSelectedTopic(exists ? selectedTopic : 'random')
      } catch (e: any) {
        setTopics([{ key: 'random', label: 'Random' }])
        setSelectedTopic('random')
      }
    }
    loadTopics()
  }, [domain])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "totalQuestions" || name === "passingScore" ? Number.parseInt(value) : value,
    }))
  }

  const handleStudentToggle = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter((id) => id !== studentId)
        : [...prev.selectedStudents, studentId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title || !formData.deadline || formData.selectedStudents.length === 0) {
      setError("Please fill all required fields and select at least one student")
      return
    }

    setLoading(true)
    try {
      // Map to assignment API with selected domain/topic
      const payload = {
        title: formData.title,
        domain,
        topic: selectedTopic,
        limit: formData.totalQuestions || 10,
        assignedTo: formData.selectedStudents,
        dueAt: new Date(formData.deadline).toISOString(),
        status: "active",
      }

      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.message || "Failed to create assignment")

      // Attempt to send reminder emails (requires SMTP config)
      try {
        await fetch(`/api/admin/assignments/${data.id}/remind`, { method: "POST" })
      } catch {}

      router.push("/admin/exams")
    } catch (err) {
      setError("Failed to create exam. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Exam</h1>
        <p className="text-muted-foreground mt-1">Set up a new exam with questions and assign students.</p>
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
              <label className="block text-sm font-medium text-foreground mb-2">Exam Title *</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Aptitude Test"
                className="border-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the exam..."
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes) *</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Total Questions *</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Deadline *</label>
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
          <h2 className="text-xl font-semibold text-foreground mb-4">Select Domain & Topic *</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full p-2 border border-blue-200 rounded"
              >
                <option value="aptitude">Aptitude</option>
                <option value="reasoning">Reasoning</option>
                <option value="cs">CS Concepts</option>
                <option value="dsa">DSA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full p-2 border border-blue-200 rounded"
              >
                {topics.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Assign Students *</h2>
          <p className="text-sm text-muted-foreground mb-4">Select students who will take this exam</p>

          {loadingStudents && <p className="text-sm text-muted-foreground">Loading students...</p>}
          {!loadingStudents && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.map((student) => (
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
              {students.length === 0 && (
                <p className="text-sm text-muted-foreground">No students found.</p>
              )}
            </div>
          )}

          <p className="text-sm text-blue-600 mt-4">{formData.selectedStudents.length} student(s) selected</p>
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
                Creating Exam...
              </>
            ) : (
              "Create Exam"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
