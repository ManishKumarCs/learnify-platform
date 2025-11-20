"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Lock, TrendingUp, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"

interface PathStep {
  id: string
  title: string
  description: string
  status: "completed" | "in-progress" | "locked"
  estimatedDays: number
  resources: string[]
  contentId: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

interface LearningPath {
  id: string
  name: string
  goal: string
  totalSteps: number
  completedSteps: number
  estimatedDuration: number
  steps: PathStep[]
  createdAt: Date
  targetCompletionDate: Date
}

export default function LearningPathPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      setError("")
      // Try API-based recommendations first
      try {
        const res = await fetch('/api/recommendations', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data?.ok && data?.path) {
            const p = data.path
            const apiPath: LearningPath = {
              id: String(p.id),
              name: String(p.name),
              goal: String(p.goal),
              totalSteps: Number(p.totalSteps || (p.steps?.length || 0)),
              completedSteps: Number(p.completedSteps || 0),
              estimatedDuration: Number(p.estimatedDuration || 0),
              steps: (p.steps || []).map((s: any) => ({
                id: String(s.id),
                title: String(s.title),
                description: String(s.description || ''),
                status: (s.status || 'locked') as any,
                estimatedDays: Number(s.estimatedDays || 3),
                resources: Array.isArray(s.resources) ? s.resources : [],
                contentId: String(s.contentId || ''),
                difficulty: (s.difficulty || 'beginner') as any,
              })),
              createdAt: new Date(p.createdAt || Date.now()),
              targetCompletionDate: new Date(p.targetCompletionDate || Date.now()),
            }
            setPaths([apiPath])
            setLoading(false)
            return
          }
        }
      } catch (e) {
        setError('Failed to load personalized recommendations. Showing defaults.')
      }

      // Fallback to localStorage/mock data
      const stored = localStorage.getItem("learningPaths")
      if (stored) {
        setPaths(JSON.parse(stored))
      } else {
        // Initialize with mock data
        const mockPaths: LearningPath[] = [
          {
            id: "1",
            name: "Master Data Structures",
            goal: "Become proficient in all major data structures",
            totalSteps: 6,
            completedSteps: 2,
            estimatedDuration: 21,
            createdAt: new Date(),
            targetCompletionDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            steps: [
              {
                id: "1-1",
                title: "Arrays and Lists Fundamentals",
                description: "Learn the basics of arrays and linked lists",
                status: "completed",
                estimatedDays: 3,
                resources: ["Video Tutorial", "Practice Problems", "Code Examples"],
                contentId: "ds-1",
                difficulty: "beginner",
              },
              {
                id: "1-2",
                title: "Stacks and Queues",
                description: "Master stack and queue data structures",
                status: "completed",
                estimatedDays: 3,
                resources: ["Interactive Visualization", "Practice Problems"],
                contentId: "ds-2",
                difficulty: "beginner",
              },
              {
                id: "1-3",
                title: "Trees and Graphs",
                description: "Understand tree and graph structures",
                status: "in-progress",
                estimatedDays: 4,
                resources: ["Video Tutorial", "Practice Problems", "Algorithm Visualization"],
                contentId: "ds-3",
                difficulty: "intermediate",
              },
              {
                id: "1-4",
                title: "Hash Tables and Sets",
                description: "Learn hashing and set operations",
                status: "locked",
                estimatedDays: 3,
                resources: ["Documentation", "Practice Problems"],
                contentId: "ds-4",
                difficulty: "intermediate",
              },
              {
                id: "1-5",
                title: "Advanced Data Structures",
                description: "Explore advanced structures like heaps and tries",
                status: "locked",
                estimatedDays: 4,
                resources: ["Research Papers", "Advanced Problems"],
                contentId: "ds-5",
                difficulty: "advanced",
              },
              {
                id: "1-6",
                title: "Data Structure Optimization",
                description: "Optimize data structures for performance",
                status: "locked",
                estimatedDays: 4,
                resources: ["Case Studies", "Performance Analysis"],
                contentId: "ds-6",
                difficulty: "advanced",
              },
            ],
          },
          {
            id: "2",
            name: "Algorithms Mastery",
            goal: "Master sorting, searching, and dynamic programming",
            totalSteps: 5,
            completedSteps: 0,
            estimatedDuration: 28,
            createdAt: new Date(),
            targetCompletionDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            steps: [
              {
                id: "2-1",
                title: "Sorting Algorithms",
                description: "Learn all major sorting techniques",
                status: "in-progress",
                estimatedDays: 5,
                resources: ["Video Tutorial", "Visualization", "Practice Problems"],
                contentId: "algo-1",
                difficulty: "beginner",
              },
              {
                id: "2-2",
                title: "Searching Algorithms",
                description: "Master binary search and other search techniques",
                status: "locked",
                estimatedDays: 4,
                resources: ["Tutorial", "Practice Problems"],
                contentId: "algo-2",
                difficulty: "beginner",
              },
              {
                id: "2-3",
                title: "Dynamic Programming Basics",
                description: "Introduction to dynamic programming",
                status: "locked",
                estimatedDays: 6,
                resources: ["Video Series", "Problem Set"],
                contentId: "algo-3",
                difficulty: "intermediate",
              },
              {
                id: "2-4",
                title: "Graph Algorithms",
                description: "BFS, DFS, and shortest path algorithms",
                status: "locked",
                estimatedDays: 6,
                resources: ["Tutorial", "Visualization", "Problems"],
                contentId: "algo-4",
                difficulty: "intermediate",
              },
              {
                id: "2-5",
                title: "Advanced Algorithms",
                description: "Greedy algorithms and advanced techniques",
                status: "locked",
                estimatedDays: 7,
                resources: ["Research Papers", "Advanced Problems"],
                contentId: "algo-5",
                difficulty: "advanced",
              },
            ],
          },
        ]
        setPaths(mockPaths)
        localStorage.setItem("learningPaths", JSON.stringify(mockPaths))
      }
      setLoading(false)
    }
    load()
  }, [])

  const getProgressPercentage = (path: LearningPath) => {
    return Math.round((path.completedSteps / path.totalSteps) * 100)
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="text-green-600" />
      case "in-progress":
        return <Circle size={20} className="text-blue-600 fill-blue-600" />
      default:
        return <Lock size={20} className="text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  if (selectedPath) {
    return (
      <div className="p-6 space-y-6">
        <button
          onClick={() => setSelectedPath(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Back to Paths
        </button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">{selectedPath.name}</h1>
          <p className="text-muted-foreground mt-2">{selectedPath.goal}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <p className="text-sm text-muted-foreground font-medium">Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{getProgressPercentage(selectedPath)}%</p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage(selectedPath)}%` }}
              ></div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0">
            <p className="text-sm text-muted-foreground font-medium">Completed Steps</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {selectedPath.completedSteps}/{selectedPath.totalSteps}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <p className="text-sm text-muted-foreground font-medium">Est. Completion</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{selectedPath.estimatedDuration} days</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Learning Steps</h2>
          <div className="space-y-4">
            {selectedPath.steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 ${
                  step.status === "completed"
                    ? "border-green-200 bg-green-50"
                    : step.status === "in-progress"
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStepIcon(step.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">
                        Step {idx + 1}: {step.title}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">{step.difficulty}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {step.estimatedDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {step.resources.length} resources
                      </span>
                    </div>
                    {step.status !== "locked" && (
                      <Link href={`/student/learning-path/${step.contentId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                          {step.status === "completed" ? "Review" : "Continue"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Learning Paths</h1>
        <p className="text-muted-foreground mt-2">
          Personalized learning journeys designed to improve your weaknesses and build expertise.
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="grid gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{path.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{path.goal}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{getProgressPercentage(path)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage(path)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  {path.completedSteps} of {path.totalSteps} steps
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {path.estimatedDuration} days
                </span>
              </div>
              <Button
                onClick={() => setSelectedPath(path)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <TrendingUp size={16} />
                View Path
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
