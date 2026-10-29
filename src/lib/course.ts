import { useMemo } from 'react'
import { MONTHS, WEEKS } from '../content/curriculum.ts'
import { loadBuiltinConcepts } from '../content/index.ts'
import type { Concept, ImportedPack, Month, Week } from './types.ts'
import { useStore } from './store.ts'

export const LIBRARY_MONTH_ID = 'm-lib'

export interface Course {
  months: Month[]
  weeks: Week[]
  concepts: Record<string, Concept>
  weekOf: Record<string, string>
  /** concept ids in learning order */
  order: string[]
  weekById: Record<string, Week>
  weeksOfMonth: (monthId: string) => Week[]
}

let builtin: Record<string, Concept> | null = null
const getBuiltin = () => builtin ?? {}

/** Must resolve before the first render that reads the course. */
export async function ensureContent() {
  builtin ??= await loadBuiltinConcepts()
}

const EMPTY = (v: unknown) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0) || v === 0

export function buildCourse(packs: ImportedPack[]): Course {
  const concepts: Record<string, Concept> = { ...getBuiltin() }
  let weeks: Week[] = WEEKS.map((w) => ({ ...w, concepts: w.concepts.filter((id) => concepts[id]) }))
  const months = [...MONTHS]

  for (const pack of packs) {
    for (const nw of pack.newWeeks) {
      if (weeks.some((w) => w.id === nw.id)) continue
      weeks.push({ ...nw, index: weeks.length + 1, concepts: [] })
      if (nw.monthId === LIBRARY_MONTH_ID && !months.some((m) => m.id === LIBRARY_MONTH_ID))
        months.push({ id: LIBRARY_MONTH_ID, index: months.length + 1, title: 'Your Library', tagline: 'Concepts you imported', emoji: '📥' })
    }
    for (const { weekId, ...c } of pack.concepts) {
      const existing = concepts[c.id]
      if (existing) {
        const merged: Concept = { ...existing }
        for (const k of Object.keys(c) as (keyof Concept)[]) {
          if (!EMPTY(c[k])) (merged as unknown as Record<string, unknown>)[k] = c[k]
        }
        concepts[c.id] = { ...merged, source: pack.title, updated: true }
      } else {
        concepts[c.id] = { ...c, source: pack.title }
      }
      weeks = weeks.map((w) => (w.id === weekId && !w.concepts.includes(c.id) ? { ...w, concepts: [...w.concepts, c.id] } : w))
    }
  }

  // drop weeks that ended up empty (e.g. a new week whose pack was removed)
  weeks = weeks.filter((w) => w.concepts.length > 0)
  const weekOf: Record<string, string> = {}
  weeks.forEach((w) => w.concepts.forEach((id) => (weekOf[id] = w.id)))
  const weekById = Object.fromEntries(weeks.map((w) => [w.id, w]))
  const usedMonths = months.filter((m) => weeks.some((w) => w.monthId === m.id))
  return {
    months: usedMonths,
    weeks,
    concepts,
    weekOf,
    order: weeks.flatMap((w) => w.concepts),
    weekById,
    weeksOfMonth: (id) => weeks.filter((w) => w.monthId === id),
  }
}

export function useCourse(): Course {
  const packs = useStore((s) => s.packs)
  return useMemo(() => buildCourse(packs), [packs])
}
