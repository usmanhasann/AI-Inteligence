/**
 * Offline-first sync engine.
 *
 * Strategy:
 *  1. All writes go to IndexedDB (Zustand) first — the app never waits for the network.
 *  2. pushAll()  — serialize the whole local snapshot and upsert it to Supabase.
 *  3. pullAll()  — read Supabase rows and merge into local state (cloud wins for
 *                  numeric totals, local wins for presence — so progress is never lost).
 *
 * Call pushAll() after any state change you want synced.
 * Call pullAll() once right after the user signs in.
 */

import { supabase } from './supabase.ts'
import { snapshot, useStore } from './store.ts'
import type { Persisted } from './store.ts'

// ── helpers ──────────────────────────────────────────────────────────────────

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// ── push (local → cloud) ─────────────────────────────────────────────────────

export async function pushAll(): Promise<void> {
  const userId = await uid()
  if (!userId) return

  const s = snapshot()

  await Promise.allSettled([
    pushSettings(userId, s),
    pushProgress(userId, s),
    pushActivity(userId, s),
    pushSrs(userId, s),
    pushPlan(userId, s),
    pushSaved(userId, s),
    pushPacks(userId, s),
  ])
}

async function pushSettings(userId: string, s: Persisted) {
  await supabase.from('settings').upsert(
    { user_id: userId, ...s.settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
}

async function pushProgress(userId: string, s: Persisted) {
  const rows = Object.entries(s.progress).map(([conceptId, p]) => ({
    user_id: userId,
    concept_id: conceptId,
    learned_at: p.learnedAt ?? null,
    quiz_best: p.quizBest ?? null,
    quiz_attempts: p.quizAttempts,
    last_seen: p.lastSeen,
    note: p.note ?? null,
    updated_at: new Date().toISOString(),
  }))
  if (rows.length === 0) return
  await supabase.from('progress').upsert(rows, { onConflict: 'user_id,concept_id' })
}

async function pushActivity(userId: string, s: Persisted) {
  const rows = Object.entries(s.activity).map(([date, a]) => ({
    user_id: userId,
    date,
    concepts: a.c,
    minutes: a.m,
    reviews: a.r,
    updated_at: new Date().toISOString(),
  }))
  if (rows.length === 0) return
  await supabase.from('activity').upsert(rows, { onConflict: 'user_id,date' })
}

async function pushSrs(userId: string, s: Persisted) {
  const rows = Object.entries(s.srs).map(([conceptId, srs]) => ({
    user_id: userId,
    concept_id: conceptId,
    box: srs.box,
    due: srs.due,
    updated_at: new Date().toISOString(),
  }))
  if (rows.length === 0) return
  await supabase.from('srs').upsert(rows, { onConflict: 'user_id,concept_id' })
}

async function pushPlan(userId: string, s: Persisted) {
  // Delete-all-then-insert is the simplest strategy for plan (small dataset, user-owned)
  await supabase.from('plan').delete().eq('user_id', userId)
  if (s.plan.length === 0) return
  await supabase.from('plan').insert(
    s.plan.map((item) => ({
      user_id: userId,
      item_id: item.id,
      concept_id: item.conceptId,
      date: item.date,
    })),
  )
}

async function pushSaved(userId: string, s: Persisted) {
  // saved items + collections as one JSON blob (simple, avoids join complexity)
  await supabase.from('saved').upsert(
    {
      user_id: userId,
      items: s.saved,
      collections: s.collections,
      week_best: s.weekBest,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
}

async function pushPacks(userId: string, s: Persisted) {
  await supabase.from('packs').upsert(
    {
      user_id: userId,
      data: s.packs,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
}

// ── pull (cloud → local) ─────────────────────────────────────────────────────

export async function pullAll(): Promise<void> {
  const userId = await uid()
  if (!userId) return

  const [settingsRes, progressRes, activityRes, srsRes, planRes, savedRes, packsRes] =
    await Promise.all([
      supabase.from('settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('progress').select('*').eq('user_id', userId),
      supabase.from('activity').select('*').eq('user_id', userId),
      supabase.from('srs').select('*').eq('user_id', userId),
      supabase.from('plan').select('*').eq('user_id', userId),
      supabase.from('saved').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('packs').select('*').eq('user_id', userId).maybeSingle(),
    ])

  const patch: Partial<Persisted> = {}

  // settings
  if (settingsRes.data) {
    const { user_id, updated_at, ...rest } = settingsRes.data
    patch.settings = rest as Persisted['settings']
  }

  // progress — merge: cloud wins on quiz scores, local wins on learned
  if (progressRes.data && progressRes.data.length > 0) {
    const local = useStore.getState().progress
    const merged: Persisted['progress'] = { ...local }
    for (const row of progressRes.data) {
      const loc = local[row.concept_id]
      merged[row.concept_id] = {
        learnedAt: loc?.learnedAt ?? row.learned_at ?? undefined,
        quizBest: Math.max(loc?.quizBest ?? 0, row.quiz_best ?? 0) || undefined,
        quizAttempts: Math.max(loc?.quizAttempts ?? 0, row.quiz_attempts ?? 0),
        lastSeen: Math.max(loc?.lastSeen ?? 0, row.last_seen ?? 0),
        note: loc?.note ?? row.note ?? undefined,
      }
    }
    patch.progress = merged
  }

  // activity — merge: take max per day
  if (activityRes.data && activityRes.data.length > 0) {
    const local = useStore.getState().activity
    const merged: Persisted['activity'] = { ...local }
    for (const row of activityRes.data) {
      const loc = local[row.date]
      merged[row.date] = {
        c: Math.max(loc?.c ?? 0, row.concepts ?? 0),
        m: Math.max(loc?.m ?? 0, row.minutes ?? 0),
        r: Math.max(loc?.r ?? 0, row.reviews ?? 0),
      }
    }
    patch.activity = merged
  }

  // srs — cloud wins (most recent due date wins)
  if (srsRes.data && srsRes.data.length > 0) {
    const local = useStore.getState().srs
    const merged: Persisted['srs'] = { ...local }
    for (const row of srsRes.data) {
      const loc = local[row.concept_id]
      // pick whichever record has the later due date (more progress)
      if (!loc || row.due > loc.due) {
        merged[row.concept_id] = { box: row.box, due: row.due }
      }
    }
    patch.srs = merged
  }

  // plan — merge: union of local + cloud items
  if (planRes.data && planRes.data.length > 0) {
    const local = useStore.getState().plan
    const remote = planRes.data.map((r) => ({
      id: r.item_id as string,
      conceptId: r.concept_id as string,
      date: r.date as string,
    }))
    const merged = [...local]
    for (const ri of remote) {
      if (!merged.some((li) => li.id === ri.id)) merged.push(ri)
    }
    patch.plan = merged
  }

  // saved + collections + weekBest
  if (savedRes.data) {
    patch.saved = savedRes.data.items ?? {}
    patch.collections = savedRes.data.collections ?? []
    patch.weekBest = savedRes.data.week_best ?? {}
  }

  // packs
  if (packsRes.data?.data) {
    const local = useStore.getState().packs
    // merge: keep all unique packs by id
    const remote = packsRes.data.data as Persisted['packs']
    const merged = [...local]
    for (const rp of remote) {
      if (!merged.some((lp) => lp.id === rp.id)) merged.push(rp)
    }
    patch.packs = merged
  }

  if (Object.keys(patch).length > 0) {
    useStore.getState().restore(patch)
  }
}

// ── debounced auto-push ───────────────────────────────────────────────────────

let _timer: ReturnType<typeof setTimeout> | null = null

/** Call this after every state mutation you want synced. Debounced 3 s. */
export function schedulePush() {
  if (_timer) clearTimeout(_timer)
  _timer = setTimeout(() => {
    _timer = null
    void pushAll()
  }, 3000)
}
