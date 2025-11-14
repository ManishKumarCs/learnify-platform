export type PracticeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
  subtopic?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export const DSA_TOPICS: { key: string; label: string }[] = [
  { key: 'arrays', label: 'Arrays' },
  { key: 'linkedlists', label: 'Linked Lists' },
]

const q = (
  question: string,
  options: string[],
  answer: string,
  explanation?: string,
  subtopic?: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): PracticeQuestion => ({ question, options, answer, explanation, subtopic, difficulty })

export const DSA_QUESTIONS: Record<string, PracticeQuestion[]> = {
  arrays: [
    q('Find max subarray sum of [−2,1,−3,4,−1,2,1,−5,4]', ['6', '7', '8', '9'], '6', 'Kadane => 6', 'Arrays - Kadane', 'intermediate'),
    q('Number of inversions in [2,4,1,3,5]?', ['2', '3', '4', '5'], '3', '', 'Arrays - Inversions', 'advanced'),
    q('Two-sum existence with target 9 in [2,7,11,15]?', ['True', 'False', 'Depends', 'None'], 'True', '', 'Arrays - Hashing', 'beginner'),
    q('Rotate array [1,2,3,4,5] by k=2 -> ?', ['[4,5,1,2,3]', '[3,4,5,1,2]', '[2,3,4,5,1]', '[5,1,2,3,4]'], '[4,5,1,2,3]', '', 'Arrays - Rotation', 'beginner'),
    q('Find missing number in [1,2,4,5]', ['0', '1', '3', '6'], '3', '', 'Arrays - Math/XOR', 'intermediate'),
    q('Majority element in [3,3,4]?', ['3', '4', 'None', 'Either'], '3', '', 'Arrays - Boyer-Moore', 'intermediate'),
    q('Merge two sorted arrays length m and n. Complexity?', ['O(m+n)', 'O(mn)', 'O(logn)', 'O(n log n)'], 'O(m+n)', '', 'Arrays - Merge', 'beginner'),
    q('Binary search works on?', ['Sorted arrays', 'Any arrays', 'Linked lists', 'Graphs'], 'Sorted arrays', '', 'Arrays - Binary Search', 'beginner'),
    q('Find second largest in [1,2,3,4]?', ['1', '2', '3', '4'], '3', '', 'Arrays - Max Tracking', 'beginner'),
    q('Max profit one transaction prices [7,1,5,3,6,4]?', ['4', '5', '6', '7'], '5', '', 'Arrays - Greedy', 'intermediate'),
  ],
  linkedlists: [
    q('Detect cycle in linked list algorithm?', ['Floyd’s', 'Dijkstra', 'Prim', 'Kruskal'], 'Floyd’s', '', 'Linked Lists - Cycle', 'intermediate'),
    q('Reverse a linked list complexity?', ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], 'O(n)', '', 'Linked Lists - Reverse', 'beginner'),
    q('Find middle of linked list method?', ['Two pointers', 'Stack', 'Queue', 'Hash'], 'Two pointers', '', 'Linked Lists - Two Pointers', 'beginner'),
    q('Delete node given only pointer to it (not tail)?', ['Copy next data', 'Cannot', 'Use prev', 'Rebuild list'], 'Copy next data', '', 'Linked Lists - In-place', 'intermediate'),
    q('Merge two sorted linked lists complexity?', ['O(n)', 'O(n log n)', 'O(1)', 'O(n^2)'], 'O(n)', '', 'Linked Lists - Merge', 'beginner'),
    q('Detect intersection of two lists by?', ['Sorting', 'Hashing or two-pointer', 'Binary search', 'Graph'], 'Hashing or two-pointer', '', 'Linked Lists - Intersection', 'intermediate'),
    q('Check palindrome list method?', ['Stack/Reverse half', 'Sort', 'BST', 'None'], 'Stack/Reverse half', '', 'Linked Lists - Palindrome', 'intermediate'),
    q('Remove nth from end uses?', ['Two pointers', 'Recursion only', 'Queue', 'Heap'], 'Two pointers', '', 'Linked Lists - Two Pointers', 'beginner'),
    q('Circular list tail points to?', ['Null', 'Head', 'Random', 'Mid'], 'Head', '', 'Linked Lists - Circular', 'beginner'),
    q('Skip list supports?', ['O(1) search', 'O(log n) search', 'O(n^2) search', 'None'], 'O(log n) search', '', 'Linked Lists - Skip List', 'advanced'),
  ],
}

// Enrich missing metadata with reasonable defaults without changing existing exports API
const DSA_DEFAULTS: Record<string, { subtopic: string; difficulty: 'beginner'|'intermediate'|'advanced' }[]> = {
  arrays: [
    { subtopic: 'Arrays - Kadane', difficulty: 'intermediate' },
    { subtopic: 'Arrays - Inversions', difficulty: 'advanced' },
    { subtopic: 'Arrays - Hashing', difficulty: 'beginner' },
    { subtopic: 'Arrays - Rotation', difficulty: 'beginner' },
    { subtopic: 'Arrays - Math/XOR', difficulty: 'intermediate' },
    { subtopic: 'Arrays - Boyer-Moore', difficulty: 'intermediate' },
    { subtopic: 'Arrays - Merge', difficulty: 'beginner' },
    { subtopic: 'Arrays - Binary Search', difficulty: 'beginner' },
    { subtopic: 'Arrays - Max Tracking', difficulty: 'beginner' },
    { subtopic: 'Arrays - Greedy', difficulty: 'intermediate' },
  ],
  linkedlists: [
    { subtopic: 'Linked Lists - Cycle', difficulty: 'intermediate' },
    { subtopic: 'Linked Lists - Reverse', difficulty: 'beginner' },
    { subtopic: 'Linked Lists - Two Pointers', difficulty: 'beginner' },
    { subtopic: 'Linked Lists - In-place', difficulty: 'intermediate' },
    { subtopic: 'Linked Lists - Merge', difficulty: 'beginner' },
    { subtopic: 'Linked Lists - Intersection', difficulty: 'intermediate' },
    { subtopic: 'Linked Lists - Palindrome', difficulty: 'intermediate' },
    { subtopic: 'Linked Lists - Two Pointers', difficulty: 'beginner' },
    { subtopic: 'Linked Lists - Circular', difficulty: 'beginner' },
    { subtopic: 'Linked Lists - Skip List', difficulty: 'advanced' },
  ],
}

for (const topic of Object.keys(DSA_QUESTIONS)) {
  const arr = DSA_QUESTIONS[topic]
  const defs = (DSA_DEFAULTS as any)[topic] || []
  DSA_QUESTIONS[topic] = arr.map((q, i) => ({
    ...q,
    subtopic: q.subtopic || defs[i]?.subtopic || `${topic} - General`,
    difficulty: q.difficulty || defs[i]?.difficulty || 'beginner',
  }))
}
