import type { Course } from './course.ts'
import type { PlanItem, Settings } from './types.ts'
import { addDays, fromISO, isWeekend, toISO, weekStart } from './dates.ts'

export const capacity = (iso: string, s: Settings) => (isWeekend(iso) ? s.weekendMin : s.weekdayMin)

export const PACE = {
  skim: { factor: 1, label: 'Skim', hint: 'Read it, glance at the lab' },
  balanced: { factor: 1.6, label: 'Balanced', hint: 'Read, play with the lab, take the quiz' },
  deep: { factor: 2.4, label: 'Deep', hint: 'Also write notes and revisit' },
} as const

/** Realistic minutes for a concept: its reading time × the chosen pace. */
export const effort = (minutes: number, s: Settings) => Math.round(minutes * PACE[s.pace ?? 'balanced'].factor)

/** Hard ceiling per day — quality beats quantity. */
export const MAX_PER_DAY = 10

/** [Saturday, Sunday] of the weekend that is "now": this one if today is Sat/Sun, otherwise the coming one. */
export function upcomingWeekend(today: string): [string, string] {
  const mon = weekStart(today)
  return [addDays(mon, 5), addDays(mon, 6)]
}

export function plannedMinutes(course: Course, items: PlanItem[], date: string, s: Settings) {
  return items.filter((p) => p.date === date).reduce((a, p) => a + effort(course.concepts[p.conceptId]?.minutes ?? 0, s), 0)
}

/**
 * Spread the next unlearned, not-yet-planned concepts across the given days,
 * respecting each day's minute budget (always placing at least one concept on a day with any budget).
 */
export function autoPlan(args: {
  course: Course
  learned: (id: string) => boolean
  plan: PlanItem[]
  days: string[]
  settings: Settings
  today: string
}): { conceptId: string; date: string }[] {
  const { course, learned, plan, days, settings, today } = args
  const scheduled = new Set(plan.filter((p) => p.date >= today).map((p) => p.conceptId))
  const queue = course.order.filter((id) => !learned(id) && !scheduled.has(id))
  const out: { conceptId: string; date: string }[] = []
  let qi = 0
  for (const d of days.filter((x) => x >= today)) {
    let left = capacity(d, settings) - plannedMinutes(course, plan, d, settings)
    let placed = plan.filter((p) => p.date === d).length
    while (qi < queue.length) {
      const m = effort(course.concepts[queue[qi]]?.minutes ?? 10, settings)
      if (placed >= MAX_PER_DAY || left <= 0 || (m > left && (placed > 0 || left < m * 0.5))) break
      out.push({ conceptId: queue[qi], date: d })
      left -= m
      placed++
      qi++
    }
  }
  return out
}

export const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`)

export { fromISO, toISO }
