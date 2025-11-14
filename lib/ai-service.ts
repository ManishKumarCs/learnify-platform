import { generateText, generateObject } from "ai"
import { z } from "zod"

// Schema for AI-generated practice questions
const PracticeQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string(),
  topic: z.string(),
})

export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>

// Generate practice questions based on student weaknesses
export async function generatePracticeQuestions(
  weaknessAreas: string[],
  difficulty: "easy" | "medium" | "hard",
  count = 5,
): Promise<PracticeQuestion[]> {
  try {
    const prompt = `Generate ${count} practice questions for a student to improve in these areas: ${weaknessAreas.join(", ")}.
    
    The questions should be:
    - At ${difficulty} difficulty level
    - Multiple choice with 4 options
    - Include detailed explanations
    - Focused on conceptual understanding
    - Progressively challenging
    
    Return as JSON array with fields: id, question, options (array of 4), correctAnswer (0-3), explanation, difficulty, category, topic`

    const { object } = await generateObject({
      model: "openai/gpt-4-turbo",
      schema: z.array(PracticeQuestionSchema),
      prompt,
    })

    return object
  } catch (error) {
    console.error("[v0] Error generating practice questions:", error)
    return generateMockPracticeQuestions(weaknessAreas, difficulty, count)
  }
}

// Generate learning content based on weaknesses
export async function generateLearningContent(
  topic: string,
  weaknessArea: string,
  studentLevel: "beginner" | "intermediate" | "advanced",
): Promise<string> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4-turbo",
      prompt: `Create a comprehensive learning guide for a ${studentLevel} student on "${topic}" 
      focusing on their weakness in "${weaknessArea}".
      
      Include:
      1. Key concepts explanation
      2. Common mistakes to avoid
      3. Step-by-step examples
      4. Practice tips
      5. Resources for further learning
      
      Keep it concise but thorough (500-800 words).`,
    })

    return text
  } catch (error) {
    console.error("[v0] Error generating learning content:", error)
    return generateMockLearningContent(topic, weaknessArea)
  }
}

// Generate personalized learning path
export async function generateLearningPath(
  weaknesses: string[],
  strengths: string[],
  studentLevel: string,
): Promise<string[]> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4-turbo",
      schema: z.object({
        path: z.array(z.string()),
      }),
      prompt: `Create a personalized learning path for a ${studentLevel} student.
      
      Weaknesses: ${weaknesses.join(", ")}
      Strengths: ${strengths.join(", ")}
      
      Return a structured learning path with 6-8 steps that:
      1. Build on existing strengths
      2. Address weaknesses progressively
      3. Include practice and assessment
      4. Are achievable in 2-4 weeks
      
      Return as JSON with "path" array of step descriptions.`,
    })

    return object.path
  } catch (error) {
    console.error("[v0] Error generating learning path:", error)
    return generateMockLearningPath(weaknesses)
  }
}

// Generate quiz questions for practice
export async function generateQuizQuestions(topic: string, count = 10): Promise<PracticeQuestion[]> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4-turbo",
      schema: z.array(PracticeQuestionSchema),
      prompt: `Generate ${count} quiz questions on "${topic}".
      
      Requirements:
      - Mix of easy, medium, and hard questions
      - Clear, unambiguous questions
      - Detailed explanations for each answer
      - Varied question types
      
      Return as JSON array.`,
    })

    return object
  } catch (error) {
    console.error("[v0] Error generating quiz questions:", error)
    return generateMockQuizQuestions(topic, count)
  }
}

// Mock functions for fallback when AI is unavailable
function generateMockPracticeQuestions(weaknessAreas: string[], difficulty: string, count: number): PracticeQuestion[] {
  const questions: PracticeQuestion[] = []
  const topics = weaknessAreas[0]?.split(" ") || ["General"]

  for (let i = 0; i < count; i++) {
    questions.push({
      id: `mock-${i}`,
      question: `Practice Question ${i + 1}: What is the key concept in ${topics[0]}?`,
      options: ["Option A - Correct answer", "Option B - Incorrect", "Option C - Incorrect", "Option D - Incorrect"],
      correctAnswer: 0,
      explanation: `This question tests your understanding of ${topics[0]}. The correct answer is A because...`,
      difficulty: difficulty as "easy" | "medium" | "hard",
      category: weaknessAreas[0] || "General",
      topic: topics[0] || "General",
    })
  }

  return questions
}

function generateMockLearningContent(topic: string, weaknessArea: string): string {
  return `
# Learning Guide: ${topic}

## Understanding ${weaknessArea}

This guide will help you master ${weaknessArea} through structured learning.

### Key Concepts
- Concept 1: Foundation of ${topic}
- Concept 2: Intermediate understanding
- Concept 3: Advanced applications

### Common Mistakes
1. Misunderstanding the basic definition
2. Applying concepts in wrong context
3. Overlooking edge cases

### Step-by-Step Examples
Follow these examples to understand better...

### Practice Tips
- Start with simple problems
- Gradually increase difficulty
- Review mistakes regularly

### Resources
- Practice problems
- Video tutorials
- Interactive exercises
  `
}

function generateMockLearningPath(weaknesses: string[]): string[] {
  return [
    `Week 1: Master fundamentals of ${weaknesses[0]}`,
    `Week 1-2: Practice basic problems and concepts`,
    `Week 2: Intermediate level practice`,
    `Week 2-3: Apply concepts to real-world scenarios`,
    `Week 3: Advanced problem solving`,
    `Week 3-4: Take mock tests and assessments`,
    `Week 4: Review and consolidate learning`,
  ]
}

function generateMockQuizQuestions(topic: string, count: number): PracticeQuestion[] {
  const questions: PracticeQuestion[] = []

  for (let i = 0; i < count; i++) {
    questions.push({
      id: `quiz-${i}`,
      question: `Quiz Question ${i + 1}: What is the definition of ${topic}?`,
      options: ["Correct definition", "Incorrect option 1", "Incorrect option 2", "Incorrect option 3"],
      correctAnswer: 0,
      explanation: `The correct answer is A. ${topic} is defined as...`,
      difficulty: i < 3 ? "easy" : i < 7 ? "medium" : "hard",
      category: topic,
      topic: topic,
    })
  }

  return questions
}
