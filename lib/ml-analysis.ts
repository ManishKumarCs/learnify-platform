// Machine Learning Analysis Module
// This module contains functions for analyzing exam responses and generating insights

export interface AnalysisResult {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  categoryScores: { category: string; score: number }[]
  overallScore: number
}

export function analyzeExamResponse(
  answers: (number | null)[],
  questions: any[],
  correctAnswers: number[],
): AnalysisResult {
  // Calculate category-wise performance
  const categoryPerformance: Record<string, { correct: number; total: number }> = {}

  questions.forEach((question, idx) => {
    const category = question.category
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { correct: 0, total: 0 }
    }

    categoryPerformance[category].total++

    if (answers[idx] === correctAnswers[idx]) {
      categoryPerformance[category].correct++
    }
  })

  // Calculate scores
  const categoryScores = Object.entries(categoryPerformance).map(([category, { correct, total }]) => ({
    category,
    score: Math.round((correct / total) * 100),
  }))

  const overallScore =
    Math.round((categoryScores.reduce((sum, cat) => sum + cat.score, 0) / categoryScores.length) * 100) / 100

  // Generate insights based on performance
  const strengths = categoryScores
    .filter((cat) => cat.score >= 80)
    .map((cat) => `Strong performance in ${cat.category}`)

  const weaknesses = categoryScores.filter((cat) => cat.score < 70).map((cat) => `Needs improvement in ${cat.category}`)

  const recommendations = generateRecommendations(categoryScores, weaknesses)

  return {
    strengths,
    weaknesses,
    recommendations,
    categoryScores,
    overallScore,
  }
}

function generateRecommendations(categoryScores: any[], weaknesses: string[]): string[] {
  const recommendations: string[] = []

  categoryScores.forEach((cat) => {
    if (cat.score < 70) {
      recommendations.push(`Focus on improving ${cat.category} with targeted practice`)
    }
  })

  if (categoryScores.some((cat) => cat.score >= 85)) {
    recommendations.push("Maintain your strong performance in high-scoring areas")
  }

  recommendations.push("Take regular mock tests to track progress")
  recommendations.push("Review incorrect answers to understand concepts better")

  return recommendations.slice(0, 4)
}

export function predictStudentLevel(scores: number[]): string {
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

  if (avgScore >= 85) return "Advanced"
  if (avgScore >= 70) return "Intermediate"
  return "Beginner"
}

export function generatePersonalizedPath(weaknesses: string[], strengths: string[]): string[] {
  const path: string[] = []

  if (weaknesses.length > 0) {
    path.push("Start with fundamentals in weak areas")
    path.push("Practice problems in identified weak categories")
  }

  path.push("Take practice tests regularly")
  path.push("Review and reinforce strong areas")

  return path
}
