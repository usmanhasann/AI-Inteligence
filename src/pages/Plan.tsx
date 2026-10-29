import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Check, ChevronLeft, ChevronRight, Plus, Search, Sparkles, Wand2, X } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../lib/course.ts'
import { useStore, toast } from '../lib/store.ts'
import { addDays, dayName, dayNum, isWeekend, monthShort, rangeLabel, todayISO, weekDays } from '../lib/dates.ts'
import { autoPlan, capacity, effort, fmtMin, PACE, plannedMinutes, upcomingWeekend } from '../lib/plan.ts'
import { confetti, useReveal } from '../lib/motion.ts'
import { Bar, Modal, Ring } from '../components/ui.tsx'
import { Seg, SliderField } from '../components/Fields.tsx'

export default function Plan() {
  const course = useCourse()
  const { plan, progress, settings, setSettings, addPlan, addPlanMany, removePlan, movePlan, clearPlanRange } = useStore()
  const today = todayISO()
  const [anchor, setAnchor] = useState(today)
  const [adding, setAdding] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const days = weekDays(anchor)
  const learned = (id: string) => !!progress[id]?.learnedAt
  useReveal(ref, [anchor])

  const [sat, sun] = upcomingWeekend(today)
  const weekend = plan.filter((p) => p.date === sat || p.date === sun)
  const weekendDone = weekend.filter((p) => learned(p.conceptId)).length
  const weekItems = plan.filter((p) => days.includes(p.date))
  const weekDone = weekItems.filter((p) => learned(p.conceptId)).length
  const overdue = plan.filter((p) => p.date < today && !learned(p.conceptId))
  const scheduledIds = new Set(plan.filter((p) => !learned(p.conceptId)).map((p) => p.conceptId))
  const queue = course.order.filter((id) => !learned(id) && !scheduledIds.has(id))

  const candidates = useMemo(() => {
    const s = q.trim().toLowerCase()
    return course.order
      .filter((id) => !learned(id))
      .filter((id) => !s || course.concepts[id].title.toLowerCase().includes(s) || course.concepts[id].tldr.toLowerCase().includes(s))
      .slice(0, 40)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, course, progress])

  const fill = (ds: string[], label: string) => {
    const items = autoPlan({ course, learned, plan, days: ds, settings, today })
    if (!items.length) return toast('Nothing to add — those days are already full', 'info')
    addPlanMany(items)
    toast(`${label}: planned ${items.length} concept${items.length > 1 ? 's' : ''}`, 'good')
    confetti(window.innerWidth / 2, 160, 36)
  }

  return (
    <div ref={ref}>
      <div className="mb-8" data-reveal>
        <div className="eyebrow mb-1">Weekly planner</div>
        <h1 className="text-4xl sm:text-5xl font-bold">Make <span className="text-gradient">time</span> count</h1>
        <p className="text-muted mt-2 max-w-xl">Short weekday sessions, deep weekend blocks. Pick what you’ll cover and when — the planner keeps each day within your budget.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          {overdue.length > 0 && (
            <div className="card p-4 flex flex-wrap items-center gap-3 border-warn/40" data-reveal style={{ borderColor: 'color-mix(in oklab, var(--warn) 45%, transparent)' }}>
              <CalendarClock className="text-warn" />
              <div className="flex-1 min-w-[200px] text-sm"><b>{overdue.length} planned concept{overdue.length > 1 ? 's' : ''}</b> slipped past their day. No guilt — move them to today?</div>
              <button className="btn btn-sm" onClick={() => { overdue.forEach((p) => movePlan(p.id, today)); toast('Moved to today', 'good') }}>Move to today</button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap" data-reveal>
            <button className="btn btn-icon" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="Previous week"><ChevronLeft size={18} /></button>
            <div className="font-display font-semibold text-lg min-w-[150px] text-center">{rangeLabel(days)}</div>
            <button className="btn btn-icon" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="Next week"><ChevronRight size={18} /></button>
            <button className="btn btn-sm" onClick={() => setAnchor(today)}>Today</button>
            <div className="ml-auto flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={() => fill(days, 'Week')}><Wand2 size={14} /> Auto-fill week</button>
              <button className="btn btn-sm" onClick={() => { clearPlanRange(days[0], days[6]); toast('Cleared this week', 'info') }} disabled={!weekItems.length}>Clear</button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {days.map((d) => {
              const items = plan.filter((p) => p.date === d)
              const mins = plannedMinutes(course, plan, d, settings)
              const cap = capacity(d, settings)
              const over = cap > 0 && mins > cap
              const isToday = d === today
              return (
                <div
                  key={d}
                  data-reveal
                  className={clsx('card p-4 flex flex-col gap-3 min-h-[170px]', isToday && 'ring-2 ring-brand/60')}
                  style={isWeekend(d) ? { background: 'linear-gradient(160deg, rgba(139,92,246,.14), var(--surface) 60%)' } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-surface2 border border-line grid place-items-center leading-none text-center shrink-0">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted">{monthShort(d)}</div>
                        <div className="font-display text-lg font-bold">{dayNum(d)}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold flex items-center gap-2">{dayName(d, true)}{isToday && <span className="chip chip-accent">Today</span>}{isWeekend(d) && <span className="chip">Deep work</span>}</div>
                      <div className="text-xs text-muted">{fmtMin(mins)} of {fmtMin(cap)}</div>
                    </div>
                    <button className="btn btn-icon btn-sm" onClick={() => { setAdding(d); setQ('') }} aria-label={`Add concept on ${dayName(d, true)}`}><Plus size={16} /></button>
                  </div>
                  <Bar value={cap ? mins / cap : 0} color={over ? 'var(--bad)' : 'linear-gradient(90deg,var(--brand),var(--brand-2))'} />
                  <ul className="grid gap-2">
                    {items.length === 0 && <li className="text-xs text-faint py-1">Nothing planned{cap ? '' : ' — rest day'}.</li>}
                    {items.map((p) => {
                      const c = course.concepts[p.conceptId]
                      if (!c) return null
                      const done = learned(p.conceptId)
                      return (
                        <li key={p.id} className={clsx('flex items-center gap-2.5 rounded-xl border px-2.5 py-2', done ? 'border-good/40 bg-good/10' : 'border-line bg-surface')}>
                          <span className={clsx('w-5 h-5 rounded-full grid place-items-center shrink-0 border', done ? 'bg-good border-good text-black' : 'border-line2')}>{done && <Check size={12} strokeWidth={3} />}</span>
                          <Link to={`/concept/${c.id}`} className="flex-1 min-w-0 text-sm font-medium truncate">{c.emoji} {c.title}</Link>
                          <span className="text-[11px] text-muted shrink-0">{effort(c.minutes, settings)}m</span>
                          {!done && d < today && <button className="text-[11px] font-semibold text-brand2" onClick={() => movePlan(p.id, today)}>→ today</button>}
                          <button onClick={() => removePlan(p.id)} className="text-faint hover:text-bad" aria-label="Remove from plan"><X size={14} /></button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="card p-5 relative overflow-hidden" data-reveal>
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <Ring value={weekend.length ? weekendDone / weekend.length : 0} size={78} stroke={8} color="#8b5cf6" color2="#22d3ee">
                <span className="font-display font-bold">{weekendDone}/{weekend.length}</span>
              </Ring>
              <div>
                <div className="eyebrow">This weekend’s goal</div>
                <div className="font-display text-lg font-semibold leading-tight">{weekend.length ? `${weekend.length} concepts` : 'Not set'}</div>
                <div className="text-xs text-muted">{dayName(sat)} {dayNum(sat)} – {dayName(sun)} {dayNum(sun)}</div>
              </div>
            </div>
            <button className="btn btn-primary w-full mt-4" onClick={() => fill([sat, sun], 'Weekend')}><Sparkles size={15} /> Fill my weekend</button>
            <div className="text-xs text-muted mt-2 text-center">Uses your {fmtMin(settings.weekendMin)} per day</div>
          </div>

          <div className="card p-5 space-y-5" data-reveal>
            <div className="eyebrow">Time budget</div>
            <SliderField label="Weekdays" value={settings.weekdayMin} min={0} max={120} step={5} unit="min / day" onChange={(v) => setSettings({ weekdayMin: v })} />
            <SliderField label="Weekend days" value={settings.weekendMin} min={30} max={600} step={15} unit="min / day" onChange={(v) => setSettings({ weekendMin: v })} format={(v) => fmtMin(v)} />
            <div>
              <div className="text-sm font-medium mb-2">Study pace</div>
              <Seg value={settings.pace} onChange={(v) => setSettings({ pace: v })} options={(Object.keys(PACE) as (keyof typeof PACE)[]).map((k) => ({ v: k, label: PACE[k].label }))} />
              <div className="text-xs text-muted mt-2">{PACE[settings.pace].hint} — a 9-min read ≈ {effort(9, settings)} min.</div>
            </div>
            <div className="text-xs text-muted">≈ {fmtMin(settings.weekdayMin * 5 + settings.weekendMin * 2)} per week · about {Math.max(0, Math.round((settings.weekdayMin * 5 + settings.weekendMin * 2) / effort(9.5, settings)))} concepts</div>
          </div>

          <div className="card p-5" data-reveal>
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow">Up next (unscheduled)</div>
              <span className="text-xs text-muted">{queue.length} left</span>
            </div>
            <div className="grid gap-2">
              {queue.slice(0, 5).map((id) => {
                const c = course.concepts[id]
                return (
                  <div key={id} className="flex items-center gap-2 rounded-xl bg-surface border border-line p-2.5">
                    <Link to={`/concept/${id}`} className="flex-1 min-w-0 text-sm font-medium truncate">{c.emoji} {c.title}</Link>
                    <button className="chip hover:border-brand2" onClick={() => { addPlan(id, today); toast('Added to today', 'good') }}>Today</button>
                    <button className="chip hover:border-brand2" onClick={() => { addPlan(id, sat); toast('Added to Saturday', 'good') }}>Sat</button>
                  </div>
                )
              })}
              {!queue.length && <div className="text-sm text-muted">Everything is scheduled or learned. 🎉</div>}
            </div>
          </div>
          <div className="text-xs text-faint text-center" data-reveal>{weekDone}/{weekItems.length} done this week</div>
        </aside>
      </div>

      <Modal open={!!adding} onClose={() => setAdding(null)} title="Add concept">
        <h3 className="font-display text-xl font-semibold mb-3">Add to {adding && dayName(adding, true)}</h3>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input !pl-10" placeholder="Search concepts…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>
        <div className="grid gap-2 max-h-[50vh] overflow-auto -mx-1 px-1">
          {candidates.map((id) => {
            const c = course.concepts[id]
            const on = plan.some((p) => p.conceptId === id && p.date === adding)
            return (
              <button key={id} disabled={on} onClick={() => adding && addPlan(id, adding)} className="flex items-center gap-3 text-left p-3 rounded-2xl border border-line bg-surface hover:bg-surface2 transition-colors disabled:opacity-50">
                <span className="text-2xl">{c.emoji}</span>
                <span className="flex-1 min-w-0"><span className="block font-semibold truncate">{c.title}</span><span className="block text-xs text-muted">Week {course.weekById[course.weekOf[id]]?.index} · ~{effort(c.minutes, settings)} min</span></span>
                {on ? <Check size={16} className="text-good" /> : <Plus size={16} className="text-brand2" />}
              </button>
            )
          })}
        </div>
        <button className="btn w-full mt-4" onClick={() => setAdding(null)}>Done</button>
      </Modal>
    </div>
  )
}
