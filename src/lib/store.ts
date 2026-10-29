import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { del, get, set } from 'idb-keyval'
import type { Collection, ConceptProgress, ImportedPack, PlanItem, SavedItem, Settings } from './types.ts'
import { addDays, todayISO } from './dates.ts'

/** IndexedDB (big, async) with a localStorage fallback for locked-down browsers. */
const storage: StateStorage = {
  async getItem(name) {
    try {
      return (await get<string>(name)) ?? null
    } catch {
      return localStorage.getItem(name)
    }
  },
  async setItem(name, value) {
    try {
      await set(name, value)
    } catch {
      localStorage.setItem(name, value)
    }
  },
  async removeItem(name) {
    try {
      await del(name)
    } catch {
      localStorage.removeItem(name)
    }
  },
}

export interface Activity {
  /** concepts learned */
  c: number
  /** minutes studied */
  m: number
  /** reviews + quizzes */
  r: number
}

export interface Srs {
  box: number
  due: number
}

export interface Persisted {
  settings: Settings
  progress: Record<string, ConceptProgress>
  activity: Record<string, Activity>
  saved: Record<string, SavedItem>
  collections: Collection[]
  plan: PlanItem[]
  srs: Record<string, Srs>
  weekBest: Record<string, number>
  packs: ImportedPack[]
  onboarded: boolean
}

interface Actions {
  setSettings: (p: Partial<Settings>) => void
  touch: (id: string) => void
  setLearned: (id: string, learned: boolean, minutes: number) => void
  recordQuiz: (id: string, score: number) => void
  recordWeekQuiz: (weekId: string, score: number) => void
  setNote: (id: string, note: string) => void
  toggleSaved: (id: string) => void
  updateSaved: (id: string, patch: Partial<SavedItem>) => void
  addCollection: (c: Omit<Collection, 'id'>) => string
  removeCollection: (id: string) => void
  addPlan: (conceptId: string, date: string) => void
  addPlanMany: (items: { conceptId: string; date: string }[]) => void
  movePlan: (id: string, date: string) => void
  removePlan: (id: string) => void
  clearPlanRange: (from: string, to: string) => void
  review: (id: string, grade: 0 | 1 | 2 | 3) => void
  addPack: (p: ImportedPack) => void
  removePack: (id: string) => void
  setOnboarded: () => void
  restore: (data: Partial<Persisted>) => void
  resetAll: () => void
}

const DEFAULTS: Persisted = {
  settings: { weekdayMin: 20, weekendMin: 120, pace: 'balanced', theme: 'dark', motion: 'system', name: '' },
  progress: {},
  activity: {},
  saved: {},
  collections: [],
  plan: [],
  srs: {},
  weekBest: {},
  packs: [],
  onboarded: false,
}

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
const bump = (act: Record<string, Activity>, patch: Partial<Activity>): Record<string, Activity> => {
  const d = todayISO()
  const cur = act[d] ?? { c: 0, m: 0, r: 0 }
  return {
    ...act,
    [d]: { c: Math.max(0, cur.c + (patch.c ?? 0)), m: Math.max(0, cur.m + (patch.m ?? 0)), r: Math.max(0, cur.r + (patch.r ?? 0)) },
  }
}

// Leitner intervals in days for boxes 1..5
export const SRS_DAYS = [1, 2, 4, 9, 21]

export const useStore = create<Persisted & Actions>()(
  persist(
    (setState, getState) => ({
      ...DEFAULTS,
      setSettings: (p) => setState((s) => ({ settings: { ...s.settings, ...p } })),
      touch: (id) =>
        setState((s) => ({
          progress: { ...s.progress, [id]: { ...s.progress[id], quizAttempts: s.progress[id]?.quizAttempts ?? 0, lastSeen: Date.now() } },
        })),
      setLearned: (id, learned, minutes) =>
        setState((s) => {
          const cur = s.progress[id] ?? { quizAttempts: 0, lastSeen: Date.now() }
          if (learned === !!cur.learnedAt) return s
          const srs = { ...s.srs }
          if (learned) srs[id] = { box: 1, due: new Date(addDays(todayISO(), 1)).getTime() }
          else delete srs[id]
          return {
            progress: { ...s.progress, [id]: { ...cur, learnedAt: learned ? Date.now() : undefined, lastSeen: Date.now() } },
            activity: bump(s.activity, learned ? { c: 1, m: minutes } : { c: -1, m: -minutes }),
            srs,
          }
        }),
      recordQuiz: (id, score) =>
        setState((s) => {
          const cur = s.progress[id] ?? { quizAttempts: 0, lastSeen: Date.now() }
          return {
            progress: {
              ...s.progress,
              [id]: { ...cur, quizAttempts: cur.quizAttempts + 1, quizBest: Math.max(cur.quizBest ?? 0, score), lastSeen: Date.now() },
            },
            activity: bump(s.activity, { r: 1 }),
          }
        }),
      recordWeekQuiz: (weekId, score) =>
        setState((s) => ({
          weekBest: { ...s.weekBest, [weekId]: Math.max(s.weekBest[weekId] ?? 0, score) },
          activity: bump(s.activity, { r: 1 }),
        })),
      setNote: (id, note) =>
        setState((s) => ({ progress: { ...s.progress, [id]: { ...s.progress[id], quizAttempts: s.progress[id]?.quizAttempts ?? 0, lastSeen: Date.now(), note } } })),
      toggleSaved: (id) =>
        setState((s) => {
          const saved = { ...s.saved }
          if (saved[id]) delete saved[id]
          else saved[id] = { savedAt: Date.now(), collections: [] }
          return { saved }
        }),
      updateSaved: (id, patch) =>
        setState((s) => ({ saved: { ...s.saved, [id]: { ...s.saved[id], savedAt: s.saved[id]?.savedAt ?? Date.now(), collections: s.saved[id]?.collections ?? [], ...patch } } })),
      addCollection: (c) => {
        const id = uid()
        setState((s) => ({ collections: [...s.collections, { ...c, id }] }))
        return id
      },
      removeCollection: (id) =>
        setState((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
          saved: Object.fromEntries(
            Object.entries(s.saved).map(([k, v]) => [k, { ...v, collections: v.collections.filter((c) => c !== id) }]),
          ),
        })),
      addPlan: (conceptId, date) =>
        setState((s) =>
          s.plan.some((p) => p.conceptId === conceptId && p.date === date) ? s : { plan: [...s.plan, { id: uid(), conceptId, date }] },
        ),
      addPlanMany: (items) =>
        setState((s) => {
          const plan = [...s.plan]
          for (const it of items) if (!plan.some((p) => p.conceptId === it.conceptId && p.date === it.date)) plan.push({ id: uid(), ...it })
          return { plan }
        }),
      movePlan: (id, date) => setState((s) => ({ plan: s.plan.map((p) => (p.id === id ? { ...p, date } : p)) })),
      removePlan: (id) => setState((s) => ({ plan: s.plan.filter((p) => p.id !== id) })),
      clearPlanRange: (from, to) => setState((s) => ({ plan: s.plan.filter((p) => p.date < from || p.date > to) })),
      review: (id, grade) =>
        setState((s) => {
          const cur = s.srs[id] ?? { box: 1, due: Date.now() }
          const box = grade === 0 ? 1 : grade === 1 ? Math.max(1, cur.box - 1) : grade === 2 ? Math.min(5, cur.box + 1) : Math.min(5, cur.box + 2)
          const days = grade === 0 ? 0.01 : SRS_DAYS[box - 1]
          return { srs: { ...s.srs, [id]: { box, due: Date.now() + days * 86400000 } }, activity: bump(s.activity, { r: 1 }) }
        }),
      addPack: (p) => setState((s) => ({ packs: [...s.packs.filter((x) => x.id !== p.id), p] })),
      removePack: (id) => setState((s) => ({ packs: s.packs.filter((p) => p.id !== id) })),
      setOnboarded: () => setState({ onboarded: true }),
      restore: (data) => setState((s) => ({ ...s, ...data, settings: { ...s.settings, ...data.settings } })),
      resetAll: () => setState({ ...DEFAULTS, onboarded: true, settings: { ...getState().settings } }),
    }),
    {
      name: 'upgrade-myself-v1',
      version: 1,
      storage: createJSONStorage(() => storage),
      // keep new default settings when older saved data lacks them
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Persisted>
        return { ...current, ...p, settings: { ...current.settings, ...p.settings } }
      },
      partialize: (s): Persisted => ({
        settings: s.settings,
        progress: s.progress,
        activity: s.activity,
        saved: s.saved,
        collections: s.collections,
        plan: s.plan,
        srs: s.srs,
        weekBest: s.weekBest,
        packs: s.packs,
        onboarded: s.onboarded,
      }),
    },
  ),
)

export function snapshot(): Persisted {
  const s = useStore.getState()
  return {
    settings: s.settings, progress: s.progress, activity: s.activity, saved: s.saved, collections: s.collections,
    plan: s.plan, srs: s.srs, weekBest: s.weekBest, packs: s.packs, onboarded: s.onboarded,
  }
}

// ───────── tiny toast store (not persisted) ─────────
export interface Toast {
  id: string
  text: string
  tone: 'info' | 'good' | 'bad'
}
export const useToasts = create<{ items: Toast[]; push: (text: string, tone?: Toast['tone']) => void; dismiss: (id: string) => void }>()(
  (setState) => ({
    items: [],
    push: (text, tone = 'info') => {
      const id = uid()
      setState((s) => ({ items: [...s.items.slice(-3), { id, text, tone }] }))
      setTimeout(() => setState((s) => ({ items: s.items.filter((t) => t.id !== id) })), 3600)
    },
    dismiss: (id) => setState((s) => ({ items: s.items.filter((t) => t.id !== id) })),
  }),
)
export const toast = (text: string, tone: Toast['tone'] = 'info') => useToasts.getState().push(text, tone)
