import type { Course } from './course.ts'
import type { Activity, Srs } from './store.ts'
import type { Concept, ConceptProgress, Week } from './types.ts'
import { addDays, fromISO, todayISO } from './dates.ts'

type Progress = Record<string, ConceptProgress>

export const isLearned = (p: Progress, id: string) => !!p[id]?.learnedAt

export function weekStats(course: Course, p: Progress, weekId: string) {
  const w = course.weekById[weekId]
  const ids = w?.concepts ?? []
  const done = ids.filter((id) => isLearned(p, id)).length
  const minutes = ids.reduce((a, id) => a + (course.concepts[id]?.minutes ?? 0), 0)
  const minutesLeft = ids.filter((id) => !isLearned(p, id)).reduce((a, id) => a + (course.concepts[id]?.minutes ?? 0), 0)
  return { done, total: ids.length, pct: ids.length ? done / ids.length : 0, minutes, minutesLeft }
}

export function monthStats(course: Course, p: Progress, monthId: string) {
  const ws = course.weeksOfMonth(monthId)
  let done = 0, total = 0, minutes = 0
  for (const w of ws) {
    const s = weekStats(course, p, w.id)
    done += s.done; total += s.total; minutes += s.minutes
  }
  return { done, total, pct: total ? done / total : 0, minutes, weeks: ws.length }
}

export function totalStats(course: Course, p: Progress) {
  const total = course.order.length
  const done = course.order.filter((id) => isLearned(p, id)).length
  return { total, done, pct: total ? done / total : 0 }
}

export function nextConcept(course: Course, p: Progress): Concept | null {
  const id = course.order.find((i) => !isLearned(p, i))
  return id ? course.concepts[id] : null
}

export function currentWeek(course: Course, p: Progress): Week | null {
  const c = nextConcept(course, p)
  return c ? course.weekById[course.weekOf[c.id]] : null
}

export function streak(activity: Record<string, Activity>) {
  const active = (d: string) => {
    const a = activity[d]
    return !!a && a.c + a.m + a.r > 0
  }
  const today = todayISO()
  let d = active(today) ? today : addDays(today, -1)
  let current = 0
  while (active(d)) {
    current++
    d = addDays(d, -1)
  }
  const days = Object.keys(activity).filter(active).sort()
  let best = 0, run = 0, prev = ''
  for (const day of days) {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return { current, best, activeToday: active(today) }
}

export function xpOf(p: Progress, activity: Record<string, Activity>): number {
  const learned = Object.values(p).filter((x) => x.learnedAt).length
  const perfect = Object.values(p).filter((x) => (x.quizBest ?? 0) >= 1).length
  const reviews = Object.values(activity).reduce((a, x) => a + x.r, 0)
  return learned * 50 + perfect * 20 + reviews * 5
}

const LEVELS = ['Newcomer', 'Explorer', 'Practitioner', 'Builder', 'Architect', 'Strategist', 'Wizard', 'Legend']
export function levelInfo(xp: number) {
  let level = 1
  while (xp >= 100 * level * level) level++
  const floor = 100 * (level - 1) * (level - 1)
  const ceil = 100 * level * level
  return { level, title: LEVELS[Math.min(level - 1, LEVELS.length - 1)], xp, floor, ceil, pct: (xp - floor) / (ceil - floor) }
}

export function dueCards(srs: Record<string, Srs>, learned: (id: string) => boolean, now = Date.now()) {
  return Object.entries(srs)
    .filter(([id, s]) => s.due <= now && learned(id))
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id)
}

/** deterministic "term of the day" */
export function termOfDay(course: Course, date = todayISO()): Concept | null {
  const ids = course.order
  if (!ids.length) return null
  const n = fromISO(date).getTime() / 86400000
  return course.concepts[ids[Math.floor(n) % ids.length]]
}

export interface Badge {
  id: string
  emoji: string
  title: string
  desc: string
  earned: boolean
  progress?: string
}

export function badges(args: {
  course: Course
  progress: Progress
  activity: Record<string, Activity>
  savedCount: number
  packCount: number
  weekBest: Record<string, number>
}): Badge[] {
  const { course, progress, activity, savedCount, packCount, weekBest } = args
  const learned = Object.values(progress).filter((x) => x.learnedAt).length
  const st = streak(activity)
  const weeksDone = course.weeks.filter((w) => weekStats(course, progress, w.id).pct >= 1).length
  const monthsDone = course.months.filter((m) => monthStats(course, progress, m.id).pct >= 1 && m.id !== 'm-lib').length
  const perfect = Object.values(progress).filter((x) => (x.quizBest ?? 0) >= 1).length
  const weekQuizzes = Object.values(weekBest).filter((v) => v >= 0.8).length
  return [
    { id: 'first', emoji: '🌱', title: 'First step', desc: 'Learn your first concept', earned: learned >= 1 },
    { id: 'ten', emoji: '📚', title: 'Ten down', desc: 'Learn 10 concepts', earned: learned >= 10, progress: `${Math.min(learned, 10)}/10` },
    { id: 'fifty', emoji: '🧠', title: 'Half-century', desc: 'Learn 50 concepts', earned: learned >= 50, progress: `${Math.min(learned, 50)}/50` },
    { id: 'streak3', emoji: '🔥', title: 'On fire', desc: '3-day streak', earned: st.best >= 3, progress: `${Math.min(st.best, 3)}/3` },
    { id: 'streak7', emoji: '⚡', title: 'Unstoppable', desc: '7-day streak', earned: st.best >= 7, progress: `${Math.min(st.best, 7)}/7` },
    { id: 'week', emoji: '🏁', title: 'Week cleared', desc: 'Finish every concept in a week', earned: weeksDone >= 1 },
    { id: 'month', emoji: '🏆', title: 'Month master', desc: 'Finish a whole month', earned: monthsDone >= 1 },
    { id: 'perfect', emoji: '🎯', title: 'Sharpshooter', desc: '3 perfect concept quizzes', earned: perfect >= 3, progress: `${Math.min(perfect, 3)}/3` },
    { id: 'boss', emoji: '⚔️', title: 'Boss slayer', desc: 'Score 80%+ on a week challenge', earned: weekQuizzes >= 1 },
    { id: 'curator', emoji: '⭐', title: 'Curator', desc: 'Save 10 concepts to your gallery', earned: savedCount >= 10, progress: `${Math.min(savedCount, 10)}/10` },
    { id: 'importer', emoji: '📥', title: 'Course builder', desc: 'Import your own material', earned: packCount >= 1 },
  ]
}
