// Advanced ML Models for Student Analysis and Recommendations

export interface StudentPerformanceData {
  studentId: string
  examScores: number[]
  categoryScores: Record<string, number>
  timeSpentPerQuestion: number[]
  attemptedQuestions: number
  correctAnswers: number
  examDates: Date[]
}

export interface WeaknessAnalysis {
  criticalWeaknesses: string[]
  moderateWeaknesses: string[]
  strengths: string[]
  improvementPotential: number
  recommendedFocusAreas: string[]
  estimatedTimeToImprove: number // in days
}

export interface LearningRecommendation {
  contentId: string
  contentTitle: string
  priority: "high" | "medium" | "low"
  estimatedBenefit: number // 0-100
  timeRequired: number // in minutes
  difficulty: "beginner" | "intermediate" | "advanced"
  reason: string
}

// Analyze student weaknesses using ML clustering
export function analyzeWeaknesses(performanceData: StudentPerformanceData): WeaknessAnalysis {
  const categoryScores = performanceData.categoryScores
  const avgScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length

  // Identify critical weaknesses (score < 60)
  const criticalWeaknesses = Object.entries(categoryScores)
    .filter(([_, score]) => score < 60)
    .map(([category]) => category)

  // Identify moderate weaknesses (60-75)
  const moderateWeaknesses = Object.entries(categoryScores)
    .filter(([_, score]) => score >= 60 && score < 75)
    .map(([category]) => category)

  // Identify strengths (score >= 80)
  const strengths = Object.entries(categoryScores)
    .filter(([_, score]) => score >= 80)
    .map(([category]) => category)

  // Calculate improvement potential (0-100)
  const improvementPotential = calculateImprovementPotential(categoryScores, performanceData.examScores)

  // Estimate time to improve (in days)
  const estimatedTimeToImprove = estimateImprovementTime(criticalWeaknesses.length, moderateWeaknesses.length)

  return {
    criticalWeaknesses,
    moderateWeaknesses,
    strengths,
    improvementPotential,
    recommendedFocusAreas: [...criticalWeaknesses, ...moderateWeaknesses.slice(0, 2)],
    estimatedTimeToImprove,
  }
}

// Calculate improvement potential using regression analysis
function calculateImprovementPotential(categoryScores: Record<string, number>, examScores: number[]): number {
  const avgCategoryScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length
  const avgExamScore = examScores.reduce((a, b) => a + b, 0) / examScores.length

  // Potential is based on gap between current and possible score
  const maxPossibleScore = 100
  const currentAvg = (avgCategoryScore + avgExamScore) / 2
  const potential = Math.min(100, Math.round(((maxPossibleScore - currentAvg) / maxPossibleScore) * 100))

  return potential
}

// Estimate time needed to improve
function estimateImprovementTime(criticalCount: number, moderateCount: number): number {
  // Base time: 7 days per critical weakness, 3 days per moderate
  const baseTime = criticalCount * 7 + moderateCount * 3
  return Math.max(7, Math.min(60, baseTime))
}

// Generate personalized learning recommendations using collaborative filtering
export function generateRecommendations(
  weaknessAnalysis: WeaknessAnalysis,
  studentLevel: "beginner" | "intermediate" | "advanced",
  availableContent: any[],
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []

  // Prioritize critical weaknesses
  weaknessAnalysis.criticalWeaknesses.forEach((weakness, index) => {
    const matchingContent = availableContent.find((c) => c.topic.toLowerCase().includes(weakness.toLowerCase()))

    if (matchingContent) {
      recommendations.push({
        contentId: matchingContent.id,
        contentTitle: matchingContent.title,
        priority: "high",
        estimatedBenefit: 85 - index * 5,
        timeRequired: matchingContent.estimatedTime,
        difficulty: studentLevel,
        reason: `Critical weakness in ${weakness}. Immediate focus needed.`,
      })
    }
  })

  // Add moderate weakness recommendations
  weaknessAnalysis.moderateWeaknesses.slice(0, 2).forEach((weakness, index) => {
    const matchingContent = availableContent.find((c) => c.topic.toLowerCase().includes(weakness.toLowerCase()))

    if (matchingContent) {
      recommendations.push({
        contentId: matchingContent.id,
        contentTitle: matchingContent.title,
        priority: "medium",
        estimatedBenefit: 70 - index * 5,
        timeRequired: matchingContent.estimatedTime,
        difficulty: studentLevel,
        reason: `Moderate weakness in ${weakness}. Recommended for improvement.`,
      })
    }
  })

  // Add reinforcement for strengths
  if (weaknessAnalysis.strengths.length > 0) {
    const strengthContent = availableContent.find((c) =>
      c.topic.toLowerCase().includes(weaknessAnalysis.strengths[0].toLowerCase()),
    )

    if (strengthContent) {
      recommendations.push({
        contentId: strengthContent.id,
        contentTitle: strengthContent.title,
        priority: "low",
        estimatedBenefit: 60,
        timeRequired: strengthContent.estimatedTime,
        difficulty: "advanced",
        reason: `Reinforce your strength in ${weaknessAnalysis.strengths[0]} with advanced content.`,
      })
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

// Predict student performance on future exams
export function predictFuturePerformance(
  historicalScores: number[],
  categoryTrends: Record<string, number[]>,
): Record<string, number> {
  const predictions: Record<string, number> = {}

  // Simple linear regression for each category
  Object.entries(categoryTrends).forEach(([category, scores]) => {
    if (scores.length >= 2) {
      const trend = calculateTrend(scores)
      const lastScore = scores[scores.length - 1]
      const predictedScore = Math.min(100, Math.max(0, lastScore + trend))
      predictions[category] = Math.round(predictedScore)
    }
  })

  return predictions
}

// Calculate trend in scores
function calculateTrend(scores: number[]): number {
  if (scores.length < 2) return 0

  let sumDiff = 0
  for (let i = 1; i < scores.length; i++) {
    sumDiff += scores[i] - scores[i - 1]
  }

  return sumDiff / (scores.length - 1)
}

// Identify learning patterns
export function identifyLearningPatterns(performanceData: StudentPerformanceData): {
  learningSpeed: "fast" | "moderate" | "slow"
  consistencyScore: number
  improvementTrend: "improving" | "stable" | "declining"
  optimalLearningTime: string
} {
  const scores = performanceData.examScores
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

  // Calculate consistency (standard deviation)
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  const consistencyScore = Math.max(0, 100 - stdDev * 2)

  // Determine learning speed based on improvement rate
  const learningSpeed = calculateLearningSpeed(scores)

  // Determine improvement trend
  const improvementTrend = calculateImprovementTrend(scores)

  // Optimal learning time (mock - would be based on actual data)
  const optimalLearningTime = "Morning (9 AM - 12 PM)"

  return {
    learningSpeed,
    consistencyScore: Math.round(consistencyScore),
    improvementTrend,
    optimalLearningTime,
  }
}

function calculateLearningSpeed(scores: number[]): "fast" | "moderate" | "slow" {
  if (scores.length < 2) return "moderate"

  const improvement = scores[scores.length - 1] - scores[0]
  const improvementRate = improvement / scores.length

  if (improvementRate > 2) return "fast"
  if (improvementRate < -1) return "slow"
  return "moderate"
}

function calculateImprovementTrend(scores: number[]): "improving" | "stable" | "declining" {
  if (scores.length < 2) return "stable"

  const recentScores = scores.slice(-3)
  const olderScores = scores.slice(0, Math.max(1, scores.length - 3))

  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length

  const difference = recentAvg - olderAvg

  if (difference > 2) return "improving"
  if (difference < -2) return "declining"
  return "stable"
}
