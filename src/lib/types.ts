export type LabId =
  | 'tokenizer'
  | 'context-window'
  | 'sampling'
  | 'embedding-space'
  | 'attention'
  | 'rag-pipeline'
  | 'chunking'
  | 'agent-loop'
  | 'cost-calculator'
  | 'request-flow'
  | 'contrast'
  | 'flexbox'

export const LAB_IDS: LabId[] = [
  'tokenizer',
  'context-window',
  'sampling',
  'embedding-space',
  'attention',
  'rag-pipeline',
  'chunking',
  'agent-loop',
  'cost-calculator',
  'request-flow',
  'contrast',
  'flexbox',
]

export type Track =
  | 'foundations'
  | 'llm'
  | 'prompting'
  | 'context'
  | 'rag'
  | 'safety'
  | 'agents'
  | 'vibe'
  | 'product'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'design'
  | 'custom'

export interface QuizQ {
  q: string
  options: string[]
  /** index into options */
  answer: number
  why: string
}

export interface GlossaryItem {
  term: string
  def: string
}

export interface Concept {
  id: string
  title: string
  emoji: string
  /** one plain-English sentence */
  tldr: string
  /** markdown */
  explain: string
  analogy: string
  /** why it matters for a vibe coder (markdown) */
  why: string
  /** markdown, may contain fenced code */
  example: string
  takeaways: string[]
  glossary: GlossaryItem[]
  quiz: QuizQ[]
  lab?: LabId
  minutes: number
  related: string[]
  /** where it came from: undefined = built-in, otherwise the title of the imported pack */
  source?: string
  /** true when an imported pack replaced/extended a built-in concept */
  updated?: boolean
}

export interface Month {
  id: string
  index: number
  title: string
  tagline: string
  emoji: string
}

export interface Week {
  id: string
  index: number
  monthId: string
  title: string
  subtitle: string
  emoji: string
  track: Track
  /** "By the end of this week you can…" */
  outcome: string
  /** ordered concept ids */
  concepts: string[]
}

export interface ParsedConcept extends Omit<Concept, 'source'> {
  /** set when the concept explicitly names a week (import) */
  weekHint?: string
}

export interface ParsedWeekGroup {
  /** e.g. 5 from "Week 5: RAG" */
  number?: number
  title: string
  concepts: ParsedConcept[]
}

export interface ParsedPack {
  title: string
  groups: ParsedWeekGroup[]
  warnings: string[]
}

export type ImportKind = 'json' | 'md' | 'pdf' | 'txt' | 'paste'

export type NewWeek = Omit<Week, 'index'>

/** A user-imported bundle of concepts (+ optionally brand-new weeks) persisted locally. */
export interface ImportedPack {
  id: string
  title: string
  fileName: string
  kind: ImportKind
  importedAt: number
  newWeeks: NewWeek[]
  concepts: (Concept & { weekId: string })[]
}

export interface Collection {
  id: string
  name: string
  emoji: string
  hue: number
}

export interface PlanItem {
  id: string
  conceptId: string
  /** local date, YYYY-MM-DD */
  date: string
}

export interface ConceptProgress {
  learnedAt?: number
  quizBest?: number
  quizAttempts: number
  lastSeen: number
  note?: string
}

export interface SavedItem {
  savedAt: number
  collections: string[]
  note?: string
}

export interface Settings {
  weekdayMin: number
  weekendMin: number
  /** how much real time a concept takes vs. its reading time: lab + quiz + notes */
  pace: 'skim' | 'balanced' | 'deep'
  theme: 'dark' | 'light'
  motion: 'system' | 'on' | 'off'
  name: string
}
