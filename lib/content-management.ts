// Content Management System for learning materials

export interface LearningContent {
  id: string
  title: string
  description: string
  category: string
  topic: string
  content: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number // in minutes
  resources: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ContentLibrary {
  [key: string]: LearningContent[]
}

// Initialize content library
export const contentLibrary: ContentLibrary = {
  "logical-reasoning": [
    {
      id: "lr-1",
      title: "Introduction to Logical Reasoning",
      description: "Learn the basics of logical reasoning and problem-solving",
      category: "Aptitude",
      topic: "Logical Reasoning",
      content:
        "Logical reasoning is the process of using a rational, systematic series of steps based on sound mathematical principles to arrive at a conclusion.",
      difficulty: "beginner",
      estimatedTime: 30,
      resources: ["https://example.com/lr-basics", "https://example.com/lr-video"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  "data-structures": [
    {
      id: "ds-1",
      title: "Arrays and Lists",
      description: "Master arrays and linked lists",
      category: "CS Core",
      topic: "Data Structures",
      content: "Arrays are fundamental data structures that store elements in contiguous memory locations.",
      difficulty: "beginner",
      estimatedTime: 45,
      resources: ["https://example.com/arrays", "https://example.com/arrays-video"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  algorithms: [
    {
      id: "algo-1",
      title: "Sorting Algorithms",
      description: "Learn various sorting techniques",
      category: "CS Core",
      topic: "Algorithms",
      content:
        "Sorting is a fundamental operation in computer science. Common algorithms include bubble sort, merge sort, and quicksort.",
      difficulty: "intermediate",
      estimatedTime: 60,
      resources: ["https://example.com/sorting", "https://example.com/sorting-video"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
}

// Get content by topic
export function getContentByTopic(topic: string): LearningContent[] {
  const key = topic.toLowerCase().replace(/\s+/g, "-")
  return contentLibrary[key] || []
}

// Get content by difficulty
export function getContentByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): LearningContent[] {
  const allContent = Object.values(contentLibrary).flat()
  return allContent.filter((content) => content.difficulty === difficulty)
}

// Get recommended content based on weaknesses
export function getRecommendedContent(weaknesses: string[]): LearningContent[] {
  const recommended: LearningContent[] = []
  const seen = new Set<string>()

  weaknesses.forEach((weakness) => {
    const key = weakness.toLowerCase().replace(/\s+/g, "-")
    const content = contentLibrary[key] || []

    content.forEach((item) => {
      if (!seen.has(item.id)) {
        recommended.push(item)
        seen.add(item.id)
      }
    })
  })

  return recommended
}

// Add new content to library
export function addContent(content: LearningContent): void {
  const key = content.topic.toLowerCase().replace(/\s+/g, "-")

  if (!contentLibrary[key]) {
    contentLibrary[key] = []
  }

  contentLibrary[key].push(content)
}
