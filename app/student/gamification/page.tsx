"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Award } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  progress: number
  target: number
  reward: number
}

export default function GamificationPage() {
  const [points, setPoints] = useState(2450)
  const [level, setLevel] = useState(8)
  const [streak, setStreak] = useState(12)
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first exam",
      icon: "🎯",
      earned: true,
      earnedDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Perfect Score",
      description: "Score 100% on any exam",
      icon: "⭐",
      earned: true,
      earnedDate: "2024-02-20",
    },
    {
      id: "3",
      name: "Streak Master",
      description: "Maintain 10-day streak",
      icon: "🔥",
      earned: true,
      earnedDate: "2024-03-10",
    },
    {
      id: "4",
      name: "Community Helper",
      description: "Help 5 students in forum",
      icon: "🤝",
      earned: false,
    },
    {
      id: "5",
      name: "Speed Demon",
      description: "Complete exam in half the time",
      icon: "⚡",
      earned: false,
    },
  ])

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Exam Master",
      description: "Complete 10 exams",
      progress: 7,
      target: 10,
      reward: 500,
    },
    {
      id: "2",
      title: "Practice Champion",
      description: "Complete 50 practice questions",
      progress: 38,
      target: 50,
      reward: 300,
    },
    {
      id: "3",
      title: "Consistency King",
      description: "Maintain 30-day streak",
      progress: 12,
      target: 30,
      reward: 1000,
    },
  ])

  const leaderboardData = [
    { rank: 1, name: "Alex Chen", points: 5200, level: 12 },
    { rank: 2, name: "Sarah Johnson", points: 4800, level: 11 },
    { rank: 3, name: "You", points: 2450, level: 8 },
    { rank: 4, name: "Mike Davis", points: 2100, level: 7 },
    { rank: 5, name: "Emma Wilson", points: 1950, level: 6 },
  ]

  const pointsData = [
    { day: "Mon", points: 150 },
    { day: "Tue", points: 200 },
    { day: "Wed", points: 180 },
    { day: "Thu", points: 220 },
    { day: "Fri", points: 250 },
    { day: "Sat", points: 190 },
    { day: "Sun", points: 160 },
  ]

  const categoryData = [
    { name: "Exams", value: 1200 },
    { name: "Practice", value: 800 },
    { name: "Community", value: 300 },
    { name: "Achievements", value: 150 },
  ]

  const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899"]

  const nextLevelXP = (level + 1) * 500
  const currentLevelXP = level * 500
  const levelProgress = ((points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Gamification & Achievements</h1>
        <p className="text-muted-foreground">Track your progress and earn rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{points}</p>
              </div>
              <Star className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{level}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak} days</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {badges.filter((b) => b.earned).length}/{badges.length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
          <CardDescription>
            {points - currentLevelXP} / {nextLevelXP - currentLevelXP} XP to next level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={levelProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pointsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Points Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Earn badges by completing challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  badge.earned ? "border-primary/50 bg-primary/5" : "border-muted opacity-50 bg-muted/20"
                }`}
              >
                <div className="text-4xl">{badge.icon}</div>
                <p className="text-sm font-semibold text-center">{badge.name}</p>
                <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
                {badge.earned && (
                  <UIBadge className="mt-2 bg-green-500/20 text-green-700 dark:text-green-400">Earned</UIBadge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Active Achievements</CardTitle>
          <CardDescription>Complete these to earn bonus rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="space-y-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <UIBadge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                  +{achievement.reward} XP
                </UIBadge>
              </div>
              <Progress value={(achievement.progress / achievement.target) * 100} />
              <p className="text-xs text-muted-foreground">
                {achievement.progress} / {achievement.target}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  entry.name === "You" ? "bg-primary/10 border-2 border-primary" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 font-bold">
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
