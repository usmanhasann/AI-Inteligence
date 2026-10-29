import type { Track } from './types.ts'

export const TRACKS: Record<Track, { label: string; hue: number }> = {
  foundations: { label: 'AI Foundations', hue: 265 },
  llm: { label: 'LLM Internals', hue: 285 },
  prompting: { label: 'Prompting', hue: 320 },
  context: { label: 'Context', hue: 190 },
  rag: { label: 'RAG & Retrieval', hue: 175 },
  safety: { label: 'Evals & Safety', hue: 150 },
  agents: { label: 'Agents & Tools', hue: 35 },
  vibe: { label: 'Vibe Coding', hue: 15 },
  product: { label: 'AI Products', hue: 345 },
  frontend: { label: 'Frontend', hue: 215 },
  backend: { label: 'Backend & Data', hue: 235 },
  devops: { label: 'DevOps & Security', hue: 100 },
  design: { label: 'Design & UX', hue: 330 },
  custom: { label: 'Your Library', hue: 55 },
}

export const accent = (hue: number, l = 66) => `hsl(${hue} 88% ${l}%)`
export const trackAccent = (t: Track) => accent(TRACKS[t].hue)
