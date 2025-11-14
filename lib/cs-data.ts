export type PracticeQuestion = {
  question: string
  answer: string
  options: string[]
  explanation?: string
  subtopic?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export const CS_TOPICS: { key: string; label: string }[] = [
  { key: 'os', label: 'Operating Systems' },
  { key: 'dbms', label: 'DBMS' },
]

const q = (
  question: string,
  options: string[],
  answer: string,
  explanation?: string,
  subtopic?: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): PracticeQuestion => ({ question, options, answer, explanation, subtopic, difficulty })

export const CS_QUESTIONS: Record<string, PracticeQuestion[]> = {
  os: [
    q('Which scheduling is non-preemptive?', ['Round Robin', 'Priority', 'FCFS', 'SRTF'], 'FCFS', '', 'Scheduling', 'beginner'),
    q('Which is a deadlock condition?', ['Mutual exclusion', 'No preemption', 'Hold and wait', 'All of these'], 'All of these', '', 'Deadlock', 'intermediate'),
    q('Page size selection affects?', ['Fragmentation', 'TLB hit', 'Context switch', 'All'], 'All', '', 'Memory Management', 'intermediate'),
    q('Thrashing is due to?', ['High CPU', 'Low I/O', 'High page fault', 'Large quantum'], 'High page fault', '', 'Paging', 'intermediate'),
    q('Segmented memory divides by?', ['Fixed size', 'Variable length', 'Pages only', 'Cache lines'], 'Variable length', '', 'Segmentation', 'beginner'),
    q('Which is not a disk scheduling?', ['SCAN', 'LOOK', 'C-SCAN', 'LRU'], 'LRU', '', 'Disk Scheduling', 'beginner'),
    q('Critical section solved by?', ['Semaphores', 'Paging', 'Segmentation', 'DMA'], 'Semaphores', '', 'Synchronization', 'intermediate'),
    q('Producer-consumer uses?', ['Mutex only', 'Semaphore', 'Paging', 'Pipes'], 'Semaphore', '', 'IPC', 'intermediate'),
    q('Kernel mode allows?', ['Privileged instructions', 'User I/O only', 'No interrupts', 'None'], 'Privileged instructions', '', 'OS Modes', 'beginner'),
    q('Context switch saves?', ['PCB', 'TLB only', 'Cache only', 'None'], 'PCB', '', 'Processes', 'beginner'),
  ],
  dbms: [
    q('Normalization reduces?', ['Anomalies', 'Indexes', 'Transactions', 'Joins'], 'Anomalies', '', 'Normalization', 'beginner'),
    q('Which normal form removes partial dependency?', ['1NF', '2NF', '3NF', 'BCNF'], '2NF', '', 'Normalization', 'beginner'),
    q('ACID: I stands for?', ['Isolation', 'Integration', 'Iteration', 'Index'], 'Isolation', '', 'Transactions', 'beginner'),
    q('Which is non-clustered index?', ['Primary key', 'Secondary index', 'Cluster key', 'Heap'], 'Secondary index', '', 'Indexing', 'intermediate'),
    q('Transaction schedule serializable means?', ['Equivalent to a serial order', 'Parallel always', 'Faster', 'Lock-free'], 'Equivalent to a serial order', '', 'Concurrency Control', 'intermediate'),
    q('View is?', ['Virtual table', 'Materialized table', 'Physical file', 'Index'], 'Virtual table', '', 'Views', 'beginner'),
    q('Foreign key ensures?', ['Entity integrity', 'Referential integrity', 'Domain integrity', 'None'], 'Referential integrity', '', 'Constraints', 'beginner'),
    q('BCNF stronger than?', ['3NF', '2NF', '1NF', 'Dknf'], '3NF', '', 'Normalization', 'intermediate'),
    q('SQL to remove table?', ['DROP TABLE T', 'DELETE TABLE T', 'REMOVE T', 'TRUNCATE DATABASE'], 'DROP TABLE T', '', 'SQL DDL', 'beginner'),
    q('Which isolation level is strictest?', ['Read uncommitted', 'Read committed', 'Repeatable read', 'Serializable'], 'Serializable', '', 'Isolation Levels', 'advanced'),
  ],
}

// Ensure defaults for metadata
const CS_DEFAULTS: Record<string, { subtopic: string; difficulty: 'beginner'|'intermediate'|'advanced' }[]> = {
  os: new Array(10).fill(0).map(() => ({ subtopic: 'OS - General', difficulty: 'beginner' })),
  dbms: new Array(10).fill(0).map(() => ({ subtopic: 'DBMS - General', difficulty: 'beginner' })),
}

for (const topic of Object.keys(CS_QUESTIONS)) {
  const arr = CS_QUESTIONS[topic]
  const defs = (CS_DEFAULTS as any)[topic] || []
  CS_QUESTIONS[topic] = arr.map((q, i) => ({
    ...q,
    subtopic: q.subtopic || defs[i]?.subtopic || `${topic} - General`,
    difficulty: q.difficulty || defs[i]?.difficulty || 'beginner',
  }))
}
