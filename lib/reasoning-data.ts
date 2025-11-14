export type PracticeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
  subtopic?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export const RE_TOPICS: { key: string; label: string }[] = [
  { key: 'logicalreasoning', label: 'Logical Reasoning' },
  { key: 'analogy', label: 'Analogy' },
]

const q = (
  question: string,
  options: string[],
  answer: string,
  explanation?: string,
  subtopic?: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): PracticeQuestion => ({ question, options, answer, explanation, subtopic, difficulty })

export const RE_QUESTIONS: Record<string, PracticeQuestion[]> = {
  logicalreasoning: [
    q('If all roses are flowers and some flowers fade quickly, which is true?', ['Some roses fade quickly', 'No roses fade quickly', 'All flowers are roses', 'None'], 'Some roses fade quickly', 'Syllogism', 'Syllogism', 'intermediate'),
    q('Statement: All pens are blue. Conclusion: Some blue are pens.', ['True', 'False', 'Cannot be determined', 'None'], 'True', '', 'Syllogism', 'beginner'),
    q('Find the odd one out: 2, 4, 8, 16, 34', ['2', '8', '16', '34'], '34', '', 'Odd One Out', 'beginner'),
    q('If A>B and B>C then A?', ['A>C', 'A=C', 'A<C', 'Cannot say'], 'A>C', '', 'Inequalities', 'beginner'),
    q('Series: 3, 6, 9, 12, ?', ['15', '16', '18', '21'], '15', '', 'Series', 'beginner'),
    q('If today is Monday, 45 days later is?', ['Wednesday', 'Thursday', 'Friday', 'Saturday'], 'Wednesday', '', 'Calendars', 'beginner'),
    q('Which does not belong? Cat, Dog, Rabbit, Snake', ['Cat', 'Dog', 'Rabbit', 'Snake'], 'Snake', 'Reptile vs mammals', 'Classification', 'beginner'),
    q('Statement: Some A are B. All B are C. Conclusion: Some A are C.', ['True', 'False', 'Cannot be determined', 'None'], 'True', '', 'Syllogism', 'intermediate'),
    q('Find missing term: A, C, E, G, ?', ['H', 'I', 'J', 'K'], 'I', 'Skip one letter', 'Series', 'beginner'),
    q('If 5% of x is 10, x = ?', ['100', '150', '200', '250'], '200', '', 'Percentages', 'beginner'),
  ],
  analogy: [
    q('Hand : Glove :: Foot : ?', ['Sock', 'Hat', 'Scarf', 'Shirt'], 'Sock', '', 'Analogy', 'beginner'),
    q('Bird : Nest :: Bee : ?', ['Web', 'Hive', 'Burrow', 'Cave'], 'Hive', '', 'Analogy', 'beginner'),
    q('Doctor : Hospital :: Teacher : ?', ['School', 'Court', 'Market', 'Lab'], 'School', '', 'Analogy', 'beginner'),
    q('Book : Pages :: House : ?', ['Bricks', 'Rooms', 'Doors', 'Walls'], 'Rooms', '', 'Analogy', 'beginner'),
    q('Knife : Cut :: Pen : ?', ['Write', 'Erase', 'Draw', 'Mark'], 'Write', '', 'Analogy', 'beginner'),
    q('Hot : Cold :: Day : ?', ['Night', 'Sun', 'Light', 'Dark'], 'Night', '', 'Opposites', 'beginner'),
    q('Ear : Hear :: Eye : ?', ['Smell', 'Taste', 'See', 'Touch'], 'See', '', 'Analogy', 'beginner'),
    q('Up : Down :: Left : ?', ['Right', 'Front', 'Back', 'Top'], 'Right', '', 'Opposites', 'beginner'),
    q('Fish : Water :: Camel : ?', ['Forest', 'Desert', 'River', 'Sea'], 'Desert', '', 'Analogy', 'beginner'),
    q('Painter : Brush :: Writer : ?', ['Pencil', 'Book', 'Pen', 'Paper'], 'Pen', '', 'Analogy', 'beginner'),
  ],
}

// Ensure defaults
const RE_DEFAULTS: Record<string, { subtopic: string; difficulty: 'beginner'|'intermediate'|'advanced' }[]> = {
  logicalreasoning: new Array(10).fill(0).map(() => ({ subtopic: 'Logical Reasoning - General', difficulty: 'beginner' })),
  analogy: new Array(10).fill(0).map(() => ({ subtopic: 'Analogy', difficulty: 'beginner' })),
}

for (const topic of Object.keys(RE_QUESTIONS)) {
  const arr = RE_QUESTIONS[topic]
  const defs = (RE_DEFAULTS as any)[topic] || []
  RE_QUESTIONS[topic] = arr.map((q, i) => ({
    ...q,
    subtopic: q.subtopic || defs[i]?.subtopic || `${topic} - General`,
    difficulty: q.difficulty || defs[i]?.difficulty || 'beginner',
  }))
}
