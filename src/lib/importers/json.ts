import { slugify } from '../mdPack.ts'
import { LAB_IDS, type LabId, type ParsedConcept, type ParsedPack, type ParsedWeekGroup, type QuizQ } from '../types.ts'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const pick = (o: Obj, ...keys: string[]): unknown => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]
  return undefined
}
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : Array.isArray(v) ? v.map(str).filter(Boolean).join('\n\n') : '')
const lines = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(str).filter(Boolean) : typeof v === 'string' ? v.split(/\n+/).map((s) => s.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean) : []

function quizFrom(v: unknown, warn: (m: string) => void, title: string): QuizQ[] {
  if (!Array.isArray(v)) return []
  const out: QuizQ[] = []
  for (const raw of v) {
    if (!isObj(raw)) continue
    const q = str(pick(raw, 'q', 'question', 'prompt'))
    const optsRaw = pick(raw, 'options', 'choices', 'answers')
    const options = Array.isArray(optsRaw) ? optsRaw.map(str).filter(Boolean) : []
    const a = pick(raw, 'answer', 'correct', 'correctIndex', 'correct_answer')
    let answer = -1
    if (typeof a === 'number') answer = a
    else if (typeof a === 'string') {
      const byText = options.findIndex((o) => o.toLowerCase() === a.trim().toLowerCase())
      answer = byText >= 0 ? byText : /^[a-z]$/i.test(a.trim()) ? a.trim().toLowerCase().charCodeAt(0) - 97 : Number.isInteger(Number(a)) ? Number(a) : -1
    }
    if (!q || options.length < 2 || answer < 0 || answer >= options.length) {
      warn(`Quiz question skipped in "${title}" (needs question, ≥2 options and a valid answer).`)
      continue
    }
    out.push({ q, options, answer, why: str(pick(raw, 'why', 'explanation', 'rationale')) })
  }
  return out
}

function glossaryFrom(v: unknown) {
  const out: { term: string; def: string }[] = []
  if (Array.isArray(v)) {
    for (const g of v) {
      if (isObj(g)) {
        const term = str(pick(g, 'term', 'name', 'title'))
        const def = str(pick(g, 'def', 'definition', 'meaning', 'description'))
        if (term && def) out.push({ term, def })
      } else if (typeof g === 'string') {
        const m = g.match(/^(.+?)\s*[:—–-]\s+(.+)$/)
        if (m) out.push({ term: m[1].replace(/\*/g, '').trim(), def: m[2].trim() })
      }
    }
  } else if (isObj(v)) for (const [term, def] of Object.entries(v)) if (typeof def === 'string') out.push({ term, def })
  return out
}

function conceptFrom(raw: unknown, warn: (m: string) => void): ParsedConcept | null {
  if (!isObj(raw)) return null
  const title = str(pick(raw, 'title', 'name', 'term', 'concept'))
  if (!title) {
    warn('A concept without a title was skipped.')
    return null
  }
  const explainSrc = pick(raw, 'explain', 'explanation', 'body', 'content', 'details', 'description', 'text')
  const tldr = str(pick(raw, 'tldr', 'summary', 'oneLiner', 'definition', 'def', 'meaning'))
  const explain = str(explainSrc) || tldr
  const lab = str(pick(raw, 'lab')) as LabId
  const hint = pick(raw, 'week', 'weekId', 'weekNumber')
  const minutes = Number(pick(raw, 'minutes', 'duration')) || 0
  const c: ParsedConcept = {
    id: slugify(str(pick(raw, 'id', 'slug')) || title),
    title,
    emoji: str(pick(raw, 'emoji', 'icon')) || '📘',
    tldr: tldr || explain.replace(/\s+/g, ' ').slice(0, 160),
    explain,
    analogy: str(pick(raw, 'analogy')),
    why: str(pick(raw, 'why', 'whyItMatters', 'why_it_matters')),
    example: str(pick(raw, 'example', 'examples')),
    takeaways: lines(pick(raw, 'takeaways', 'keyTakeaways', 'key_takeaways')),
    glossary: glossaryFrom(pick(raw, 'glossary', 'terms')),
    quiz: quizFrom(pick(raw, 'quiz', 'questions'), warn, title),
    lab: lab && LAB_IDS.includes(lab) ? lab : undefined,
    minutes: minutes || Math.min(30, Math.max(4, Math.round(explain.split(/\s+/).length / 170 + 3))),
    related: lines(pick(raw, 'related')),
    weekHint: hint === undefined ? undefined : String(hint),
  }
  return c
}

/** Accepts: {title, weeks:[{title, concepts:[…]}], concepts:[…]}, a bare array of concepts, or [{term, definition}] lists. */
export function parseJsonPack(text: string, fallbackTitle: string): ParsedPack {
  const warnings: string[] = []
  const warn = (m: string) => warnings.push(m)
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error(`That file isn't valid JSON (${(e as Error).message}).`)
  }
  const root: Obj = Array.isArray(data) ? { concepts: data } : isObj(data) ? data : {}
  const title = str(pick(root, 'title', 'name')) || fallbackTitle
  const groups: ParsedWeekGroup[] = []

  const weeksRaw = pick(root, 'weeks', 'modules', 'sections')
  if (Array.isArray(weeksRaw)) {
    for (const w of weeksRaw) {
      if (!isObj(w)) continue
      const cs = (Array.isArray(pick(w, 'concepts', 'items', 'topics')) ? (pick(w, 'concepts', 'items', 'topics') as unknown[]) : [])
        .map((c) => conceptFrom(c, warn))
        .filter((c): c is ParsedConcept => !!c)
      if (!cs.length) continue
      const n = Number(pick(w, 'number', 'index', 'week'))
      groups.push({ number: Number.isFinite(n) && n > 0 ? n : undefined, title: str(pick(w, 'title', 'name')) || `Imported week ${groups.length + 1}`, concepts: cs })
    }
  }
  const flat = pick(root, 'concepts', 'items', 'terms', 'topics', 'cards')
  if (Array.isArray(flat)) {
    const cs = flat.map((c) => conceptFrom(c, warn)).filter((c): c is ParsedConcept => !!c)
    if (cs.length) groups.push({ title: str(pick(root, 'weekTitle')) || title, concepts: cs })
  }
  if (!groups.length) throw new Error('No concepts found in this JSON. Expected {"concepts":[{"title":…}]} or {"weeks":[…]} — download the template to see the format.')
  const seen = new Set<string>()
  for (const g of groups)
    for (const c of g.concepts) {
      if (seen.has(c.id)) {
        warn(`Duplicate id "${c.id}" — kept the later one.`)
      }
      seen.add(c.id)
    }
  return { title, groups, warnings }
}
