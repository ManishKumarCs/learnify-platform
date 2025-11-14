"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

type Q = {
  id: string
  title: string
  category?: string
  difficulty?: string
}

export default function QuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState<Q[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/questions", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setItems(
          data.map((d: any) => ({
            id: d.id,
            title: d.title || d.text,
            category: d.category,
            difficulty: d.difficulty,
          }))
        )
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  const filteredQuestions = items.filter(
    (q) =>
      (q.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.category || "").toLowerCase().includes(searchTerm.toLowerCase()),
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Questions</h1>
        <p className="text-muted-foreground mt-1">Manage exam questions and content.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative flex-1 md:max-w-sm">
            <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200"
            />
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 flex items-center gap-2">
            <Plus size={18} />
            Add Question
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Question</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Exam</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Difficulty</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-medium text-foreground line-clamp-2">{question.title}</p>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">{question.category || "-"}</td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">-</td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty || "Medium")}`}
                    >
                      {question.difficulty || "Medium"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit size={18} className="text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
