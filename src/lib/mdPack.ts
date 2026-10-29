// Markdown <-> course-pack parser. Pure TS (no deps) so it also runs under
// `node --experimental-strip-types` for scripts/validate-content.ts.
import type { GlossaryItem, LabId, ParsedConcept, ParsedPack, ParsedWeekGroup, QuizQ } from './types.ts'
import { LAB_IDS } from './types.ts'

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

const SECTION_ALIASES: Record<string, string> = {
  explain: 'explain',
  explanation: 'explain',
  simple: 'explain',
  'deep dive': 'explain',
  'the idea': 'explain',
  overview: 'explain',
  details: 'explain',
  'what it is': 'explain',
  analogy: 'analogy',
  'mental model': 'analogy',
  'think of it like': 'analogy',
  why: 'why',
  'why it matters': 'why',
  'why you care': 'why',
  'why it matters for you': 'why',
  example: 'example',
  examples: 'example',
  'in practice': 'example',
  'try it': 'example',
  takeaways: 'takeaways',
  'key takeaways': 'takeaways',
  remember: 'takeaways',
  summary: 'takeaways',
  glossary: 'glossary',
  terms: 'glossary',
  jargon: 'glossary',
  'related terms': 'glossary',
  quiz: 'quiz',
  'check yourself': 'quiz',
  'quick check': 'quiz',
  'test yourself': 'quiz',
}

function sectionKey(heading: string): string | null {
  const k = heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return SECTION_ALIASES[k] ?? null
}

function parseFrontmatter(text: string): { meta: Record<string, string>; body: string } {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta: {}, body: text }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (kv) meta[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return { meta, body: text.slice(m[0].length) }
}

function parseMetaComment(line: string): Record<string, string> | null {
  const m = line.trim().match(/^<!--\s*([\s\S]*?)\s*-->$/)
  if (!m) return null
  const out: Record<string, string> = {}
  for (const part of m[1].split('|')) {
    const kv = part.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/)
    if (kv) out[kv[1].toLowerCase()] = kv[2]
  }
  return Object.keys(out).length ? out : null
}

function listItems(lines: string[]): string[] {
  const items: string[] = []
  for (const raw of lines) {
    const m = raw.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/)
    if (m) items.push(m[1].trim())
    else if (raw.trim() && items.length && /^\s{2,}\S/.test(raw)) items[items.length - 1] += ' ' + raw.trim()
  }
  return items
}

function parseGlossary(lines: string[]): GlossaryItem[] {
  const out: GlossaryItem[] = []
  for (const item of listItems(lines)) {
    let m = item.match(/^\*\*(.+?)\*\*\s*[:—–-]*\s*(.*)$/)
    if (!m) m = item.match(/^(.+?)\s+[—–]\s+(.*)$/) || item.match(/^(.+?)\s*:\s+(.*)$/) || item.match(/^(.+?)\s+-\s+(.*)$/)
    if (m && m[2]) out.push({ term: m[1].replace(/[*_`]/g, '').trim(), def: m[2].trim() })
  }
  return out
}

function parseQuiz(lines: string[], warn: (m: string) => void, conceptTitle: string): QuizQ[] {
  const out: QuizQ[] = []
  let cur: { q: string; options: string[]; answer: number; why: string; inWhy: boolean } | null = null
  const flush = () => {
    if (!cur) return
    if (cur.options.length >= 2 && cur.answer >= 0) {
      out.push({ q: cur.q, options: cur.options, answer: cur.answer, why: cur.why.trim() })
    } else warn(`Quiz question skipped in "${conceptTitle}": needs ≥2 options and one [x] answer ("${cur.q.slice(0, 40)}…")`)
    cur = null
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const q = line.match(/^(?:\*\*)?Q\d*\s*[.:)]?\s*(?:\*\*)?\s*:?\s*(.+)$/i)
    const opt = line.match(/^[-*+]\s*\[( |x|X)\]\s*(.+)$/)
    const why = line.match(/^(?:\*\*|\*|_)?Why(?:\*\*|\*|_)?\s*:\s*(?:\*\*|\*|_)?\s*(.*)$/i)
    if (opt && cur) {
      cur.options.push(opt[2].trim())
      if (opt[1].toLowerCase() === 'x') cur.answer = cur.options.length - 1
      cur.inWhy = false
    } else if (why && cur) {
      cur.why = why[1].replace(/(?:\*|_)+$/, '').trim()
      cur.inWhy = true
    } else if (q && !opt) {
      flush()
      cur = { q: q[1].replace(/\*\*$/, '').trim(), options: [], answer: -1, why: '', inWhy: false }
    } else if (cur?.inWhy) {
      cur.why += ' ' + line.replace(/(?:\*|_)+$/, '')
    }
  }
  flush()
  return out
}

function firstSentence(md: string): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const m = plain.match(/^(.{20,220}?[.!?])(\s|$)/)
  return (m ? m[1] : plain.slice(0, 180)).trim()
}

function estimateMinutes(c: { explain: string; example: string; quiz: QuizQ[] }): number {
  const words = (c.explain + ' ' + c.example).split(/\s+/).length
  return Math.min(30, Math.max(4, Math.round(words / 170 + 2 + c.quiz.length)))
}

interface Draft {
  title: string
  id: string
  meta: Record<string, string>
  tldr: string
  sections: Record<string, string[]>
  order: string[]
}

export function parseMarkdownPack(input: string, fallbackTitle = 'Imported notes'): ParsedPack {
  const warnings: string[] = []
  const text = input.replace(/\r\n?/g, '\n')
  const { meta: fm, body } = parseFrontmatter(text)
  const packTitle = fm.title || fallbackTitle
  const groups: ParsedWeekGroup[] = []
  let group: ParsedWeekGroup | null = null
  let draft: Draft | null = null
  let section = 'explain'
  let inFence = false
  const seenIds = new Set<string>()

  const ensureGroup = () => {
    if (!group) {
      group = { title: fm.week && !/^\d+$/.test(fm.week) ? fm.week : packTitle, concepts: [] }
      if (fm.week && /^\d+$/.test(fm.week)) group.number = Number(fm.week)
      groups.push(group)
    }
    return group
  }

  const finishDraft = () => {
    if (!draft) return
    const d = draft
    draft = null
    const sec = (k: string) => (d.sections[k] ?? []).join('\n').trim()
    const explain = [sec('explain'), ...d.order.filter((k) => k.startsWith('x:')).map((k) => `### ${k.slice(2)}\n${(d.sections[k] ?? []).join('\n').trim()}`)]
      .filter(Boolean)
      .join('\n\n')
    const quiz = parseQuiz(d.sections.quiz ?? [], (m) => warnings.push(m), d.title)
    if (!explain && !d.tldr) warnings.push(`"${d.title}" has no explanation text.`)
    let id = d.meta.id || d.id
    if (seenIds.has(id)) {
      warnings.push(`Duplicate concept id "${id}" in this file — renamed.`)
      id = `${id}-${seenIds.size + 1}`
    }
    seenIds.add(id)
    const lab = d.meta.lab as LabId | undefined
    if (lab && !LAB_IDS.includes(lab)) warnings.push(`"${d.title}": unknown lab "${lab}" ignored.`)
    const example = sec('example')
    const concept: ParsedConcept = {
      id,
      title: d.title,
      emoji: d.meta.emoji || '📘',
      tldr: d.tldr || firstSentence(explain),
      explain: explain || d.tldr,
      analogy: sec('analogy'),
      why: sec('why'),
      example,
      takeaways: listItems(d.sections.takeaways ?? []),
      glossary: parseGlossary(d.sections.glossary ?? []),
      quiz,
      lab: lab && LAB_IDS.includes(lab) ? lab : undefined,
      minutes: Number(d.meta.minutes) || 0,
      related: (d.meta.related ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      weekHint: d.meta.week || undefined,
    }
    if (!concept.minutes) concept.minutes = estimateMinutes(concept)
    ensureGroup().concepts.push(concept)
  }

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (!inFence) {
      const h1 = line.match(/^#\s+(.+?)\s*#*$/)
      const h2 = line.match(/^##\s+(.+?)\s*#*$/)
      const h3 = line.match(/^###\s+(.+?)\s*#*$/)
      if (h1) {
        finishDraft()
        const m = h1[1].match(/^(?:week\s*(\d+)\s*[:.\-–—]?\s*)?(.*)$/i)
        group = { number: m?.[1] ? Number(m[1]) : undefined, title: (m?.[2] || h1[1]).trim(), concepts: [] }
        groups.push(group)
        continue
      }
      if (h2) {
        finishDraft()
        const idm = h2[1].match(/^(.*?)\s*\{#([\w-]+)\}\s*$/)
        const title = (idm ? idm[1] : h2[1]).trim()
        draft = { title, id: idm ? idm[2] : slugify(title), meta: {}, tldr: '', sections: {}, order: [] }
        section = 'explain'
        continue
      }
      if (h3 && draft) {
        const key = sectionKey(h3[1])
        section = key ?? `x:${h3[1].trim()}`
        if (!draft.sections[section]) {
          draft.sections[section] = []
          draft.order.push(section)
        }
        continue
      }
      if (draft) {
        const mc = parseMetaComment(line)
        if (mc) {
          Object.assign(draft.meta, mc)
          continue
        }
        const tl = line.match(/^\s*(?:\*\*)?TL;?DR(?:\*\*)?\s*:\s*(?:\*\*)?\s*(.+)$/i)
        if (tl && section === 'explain' && !draft.tldr) {
          draft.tldr = tl[1].replace(/\*\*$/, '').trim()
          continue
        }
      }
    }
    if (draft) (draft.sections[section] ??= []).push(line)
  }
  finishDraft()

  if (!groups.some((g) => g.concepts.length)) warnings.push('No concepts found. Use "## Concept title" headings (see the template).')
  return { title: packTitle, groups: groups.filter((g) => g.concepts.length), warnings }
}

const bullet = (xs: string[]) => xs.map((x) => `- ${x}`).join('\n')

export function conceptToMarkdown(c: Omit<ParsedConcept, 'weekHint'> & { weekHint?: string }): string {
  const meta = [`emoji: ${c.emoji}`, `minutes: ${c.minutes}`, c.lab ? `lab: ${c.lab}` : '', c.related.length ? `related: ${c.related.join(', ')}` : '']
    .filter(Boolean)
    .join(' | ')
  const parts = [`## ${c.title} {#${c.id}}`, `<!-- ${meta} -->`, '', `**TL;DR:** ${c.tldr}`, '', '### Explain', c.explain]
  if (c.analogy) parts.push('', '### Analogy', c.analogy)
  if (c.why) parts.push('', '### Why it matters', c.why)
  if (c.example) parts.push('', '### Example', c.example)
  if (c.takeaways.length) parts.push('', '### Takeaways', bullet(c.takeaways))
  if (c.glossary.length) parts.push('', '### Glossary', bullet(c.glossary.map((g) => `**${g.term}** — ${g.def}`)))
  if (c.quiz.length) {
    parts.push('', '### Quiz')
    c.quiz.forEach((q) => {
      parts.push('', `**Q:** ${q.q}`, ...q.options.map((o, i) => `- [${i === q.answer ? 'x' : ' '}] ${o}`), `*Why:* ${q.why}`)
    })
  }
  return parts.join('\n') + '\n'
}
