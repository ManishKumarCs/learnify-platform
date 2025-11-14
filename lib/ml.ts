// Lightweight ML utilities for student performance analysis
// No external ML libs; implements simple statistics, linear regression, and logistic scoring.

import ExamAttempt from '@/models/examAttempt'
import PracticeAttempt from '@/models/practiceAttempt'
import QuizAttempt from '@/models/quizAttempt'
import AptitudeAttempt from '@/models/aptitudeAttempt'

export type ScorePoint = { t: number; score: number }
export type WeakTopic = { topic: string; domain?: string; accuracy: number; count: number }
export type SubtopicStat = { subtopic: string; correct: number; total: number; accuracy: number }

export function linearRegression(points: ScorePoint[]) {
  if (points.length < 2) {
    const y = points[0]?.score ?? 0
    return { a: 0, b: y, predict: (x: number) => y }
  }
  const n = points.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const p of points) {
    sumX += p.t; sumY += p.score; sumXY += p.t * p.score; sumX2 += p.t * p.t
  }
  const denom = (n * sumX2 - sumX * sumX) || 1
  const a = (n * sumXY - sumX * sumY) / denom // slope
  const b = (sumY - a * sumX) / n // intercept
  return { a, b, predict: (x: number) => a * x + b }
}

export function logistic(z: number) {
  return 1 / (1 + Math.exp(-z))
}

export function passFailProbability(currentScore: number, trendSlope: number) {
  // Feature: normalized score and slope
  const s = (currentScore - 50) / 20 // center at 50, scale
  const m = trendSlope / 0.1 // scale slope
  const z = 0.8 * s + 0.4 * m // weights chosen heuristically
  return logistic(z)
}

export async function loadAllAttempts(userId: string) {
  const [exams, practices, quizzes, aptitudes] = await Promise.all([
    ExamAttempt.find({ userId }).sort({ createdAt: 1 }).lean(),
    PracticeAttempt.find({ userId }).sort({ createdAt: 1 }).lean(),
    QuizAttempt.find({ userId }).sort({ createdAt: 1 }).lean(),
    AptitudeAttempt.find({ userId }).sort({ createdAt: 1 }).lean(),
  ])
  return { exams, practices, quizzes, aptitudes }
}

export function buildTimeline(attempts: any[]) {
  const points: ScorePoint[] = []
  for (const a of attempts) {
    const created = new Date(a.createdAt || a.submittedAt || Date.now()).getTime()
    const score = typeof a.score === 'number' ? a.score : Math.round(((a.correctAnswers || 0) / (a.totalQuestions || a.total || 1)) * 100)
    points.push({ t: created, score })
  }
  return points
}

export function computeWeakTopics(all: { practices: any[]; quizzes: any[]; aptitudes: any[] }) {
  const map = new Map<string, { correct: number; total: number; domain?: string }>()
  const add = (key: string, ok: number, tot: number, domain?: string) => {
    const v = map.get(key) || { correct: 0, total: 0, domain }
    v.correct += ok; v.total += tot; if (domain) v.domain = domain
    map.set(key, v)
  }
  for (const p of all.practices) {
    const topic = p.topic
    add(`${p.domain}:${topic}`, Number(p.score||0), Number(p.total||0), p.domain)
  }
  for (const q of all.quizzes) {
    const topic = q.topic
    const qs = (q.questions||[]) as any[]
    const correct = qs.filter(x => x.wasCorrect).length
    add(`quiz:${topic}`, correct, qs.length, 'quiz')
  }
  for (const a of all.aptitudes) {
    const topic = a.topic
    add(`aptitude:${topic}`, Number(a.score||0), Number(a.total||0), 'aptitude')
  }
  const result: WeakTopic[] = []
  for (const [k, v] of map) {
    const acc = v.total > 0 ? (v.correct / v.total) : 0
    const [domain, topic] = k.includes(':') ? k.split(':', 2) : ['general', k]
    result.push({ topic, domain, accuracy: Math.round(acc * 100), count: v.total })
  }
  result.sort((a, b) => a.accuracy - b.accuracy)
  return result
}

export function buildAnalysisPayload(points: ScorePoint[], weakTopics: WeakTopic[], predicted: number, passProb: number) {
  // Category scores: top 5 weakest topics
  const categoryScores = weakTopics.slice(0, 5).map(w => ({ name: `${w.domain}:${w.topic}`, score: w.accuracy }))
  // Radar data: combine few axes
  const recent = points.slice(-5)
  const avgRecent = recent.length ? Math.round(recent.reduce((s,p)=>s+p.score,0)/recent.length) : 0
  const radarData = [
    { category: 'Recent Avg', value: avgRecent },
    { category: 'Predicted', value: Math.max(0, Math.min(100, Math.round(predicted))) },
    { category: 'Pass Prob', value: Math.round(passProb * 100) },
  ]
  return { categoryScores, radarData, predictedScore: predicted, passProbability: passProb, weakTopics }
}

// Heuristic subtopic inference from question text
export function inferSubtopic(questionText: string, domain?: string, topic?: string) {
  const t = (questionText || '').toLowerCase()
  const checks: Array<[string, RegExp[]]> = [
    ['Ratios', [/\bratio\b/, /\bproportion\b/]],
    ['Percentages', [/\bpercent/, /%/]],
    ['Time & Work', [/time\s*&?\s*work/, /work\s+rate/]],
    ['Permutations', [/\bpermutation\b/, /\barrang/]],
    ['Combinations', [/\bcombination\b/, /\bchoose\b/]],
    ['Probability', [/\bprobab/]],
    ['Dynamic Programming', [/\bdp\b/, /dynamic\s+programming/]],
    ['Greedy', [/\bgreedy\b/]],
    ['Graphs', [/\bgraph\b/, /bfs|dfs/]],
    ['Arrays', [/\barray\b/]],
    ['Strings', [/\bstring\b/]],
  ]
  for (const [name, regs] of checks) {
    if (regs.some(r => r.test(t))) return name
  }
  return topic || 'General'
}

export function aggregatePerSubtopic(questions: any[], answers: number[], domain?: string, topic?: string): SubtopicStat[] {
  const map = new Map<string, { correct: number; total: number }>()
  questions.forEach((q: any, idx: number) => {
    const sub = q.subtopic || inferSubtopic(q.text || q.questionText || '', domain, topic)
    const sel = answers[idx]
    const ok = typeof q.correctIndex === 'number' && typeof sel === 'number' && q.correctIndex === sel
    const cur = map.get(sub) || { correct: 0, total: 0 }
    cur.correct += ok ? 1 : 0
    cur.total += 1
    map.set(sub, cur)
  })
  return Array.from(map.entries()).map(([subtopic, { correct, total }]) => ({ subtopic, correct, total, accuracy: total ? Math.round((correct/total)*100) : 0 }))
}
