"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Target, Zap, Clock, Award } from "lucide-react"

interface ProgressData {
  date: string
  score: number
  questionsAttempted: number
  correctAnswers: number
}

interface SkillData {
  skill: string
  current: number
  target: number
}

export default function AnalyticsPage() {
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [skillData, setSkillData] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load analytics data from localStorage
    const stored = localStorage.getItem("analyticsData")
    if (stored) {
      const data = JSON.parse(stored)
      setProgressData(data.progress)
      setSkillData(data.skills)
    } else {
      // Initialize with mock data
      const mockProgress: ProgressData[] = [
        { date: "Day 1", score: 65, questionsAttempted: 20, correctAnswers: 13 },
        { date: "Day 2", score: 68, questionsAttempted: 22, correctAnswers: 15 },
        { date: "Day 3", score: 72, questionsAttempted: 25, correctAnswers: 18 },
        { date: "Day 4", score: 75, questionsAttempted: 23, correctAnswers: 17 },
        { date: "Day 5", score: 78, questionsAttempted: 28, correctAnswers: 22 },
        { date: "Day 6", score: 82, questionsAttempted: 26, correctAnswers: 21 },
        { date: "Day 7", score: 85, questionsAttempted: 30, correctAnswers: 25 },
      ]

      const mockSkills: SkillData[] = [
        { skill: "Data Structures", current: 72, target: 90 },
        { skill: "Algorithms", current: 68, target: 85 },
        { skill: "Problem Solving", current: 75, target: 90 },
        { skill: "Logical Reasoning", current: 80, target: 95 },
        { skill: "Time Complexity", current: 65, target: 85 },
      ]

      setProgressData(mockProgress)
      setSkillData(mockSkills)
      localStorage.setItem("analyticsData", JSON.stringify({ progress: mockProgress, skills: mockSkills }))
    }
    setLoading(false)
  }, [])

  const avgScore = Math.round(progressData.reduce((sum, d) => sum + d.score, 0) / progressData.length)
  const totalQuestionsAttempted = progressData.reduce((sum, d) => sum + d.questionsAttempted, 0)
  const totalCorrectAnswers = progressData.reduce((sum, d) => sum + d.correctAnswers, 0)
  const accuracy = Math.round((totalCorrectAnswers / totalQuestionsAttempted) * 100)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Analytics</h1>
        <p className="text-muted-foreground mt-2">Track your progress and identify improvement areas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Average Score</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{avgScore}%</p>
            </div>
            <Award size={32} className="text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Accuracy</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{accuracy}%</p>
            </div>
            <Target size={32} className="text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Questions Attempted</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalQuestionsAttempted}</p>
            </div>
            <Zap size={32} className="text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Days Active</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{progressData.length}</p>
            </div>
            <Clock size={32} className="text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress Trend</TabsTrigger>
          <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
          <TabsTrigger value="details">Detailed Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Score Progression</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={2} name="Score %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Questions Attempted vs Correct</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="questionsAttempted" fill="var(--chart-2)" name="Attempted" />
                <Bar dataKey="correctAnswers" fill="var(--chart-1)" name="Correct" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Skills Radar</h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" stroke="var(--muted-foreground)" />
                <PolarRadiusAxis stroke="var(--muted-foreground)" />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.6}
                />
                <Radar name="Target" dataKey="target" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid gap-4 mt-6">
            {skillData.map((skill) => (
              <Card key={skill.skill} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{skill.skill}</h3>
                  <span className="text-sm font-bold text-blue-600">
                    {skill.current}% / {skill.target}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${(skill.current / skill.target) * 100}%` }}
                  ></div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Statistics</h2>
            <div className="space-y-4">
              {progressData.map((data, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{data.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.correctAnswers} correct out of {data.questionsAttempted} questions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{data.score}%</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
