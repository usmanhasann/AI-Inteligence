import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarCheck2, Download, Flame, Layers, Lightbulb, Play, Sparkles, Target, Trophy } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../lib/course.ts'
import { useStore } from '../lib/store.ts'
import { badges, currentWeek, dueCards, levelInfo, monthStats, nextConcept, streak, termOfDay, totalStats, xpOf } from '../lib/stats.ts'
import { effort, fmtMin, upcomingWeekend } from '../lib/plan.ts'
import { addDays, dayName, todayISO } from '../lib/dates.ts'
import { gsap, reduced, useGSAP, useReveal } from '../lib/motion.ts'
import { Bar, Counter, Ring, SectionTitle } from '../components/ui.tsx'
import { WeekCard } from '../components/cards.tsx'
import { TRACKS, accent } from '../lib/tracks.ts'

const Hero3D = lazy(() => import('../components/Hero3D.tsx'))

function greet() {
  const h = new Date().getHours()
  return h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function Heatmap() {
  const activity = useStore((s) => s.activity)
  const today = todayISO()
  const start = addDays(today, -(7 * 14 - 1) - ((new Date().getDay() + 6) % 7))
  const cols: string[][] = []
  for (let w = 0; w < 15; w++) cols.push(Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)))
  const level = (d: string) => {
    const a = activity[d]
    const v = a ? a.c * 2 + a.r + a.m / 15 : 0
    return v === 0 ? 0 : v < 2 ? 1 : v < 4 ? 2 : v < 7 ? 3 : 4
  }
  const colors = ['var(--surface-2)', 'rgba(139,92,246,.35)', 'rgba(139,92,246,.6)', 'rgba(99,102,241,.85)', 'rgba(34,211,238,.95)']
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-[5px] min-w-max">
        {cols.map((c, i) => (
          <div key={i} className="flex flex-col gap-[5px]">
            {c.map((d) => (
              <div
                key={d}
                title={`${d}: ${activity[d] ? `${activity[d].c} learned, ${activity[d].r} reviews` : 'no activity'}`}
                className={clsx('w-[15px] h-[15px] rounded-[4px]', d === today && 'ring-1 ring-brand2')}
                style={{ background: d > today ? 'transparent' : colors[level(d)], opacity: d > today ? 0.2 : 1, border: d > today ? '1px dashed var(--border)' : 'none' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const course = useCourse()
  const nav = useNavigate()
  const { progress, activity, settings, plan, srs, saved, packs, weekBest } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const total = totalStats(course, progress)
  const st = streak(activity)
  const xp = xpOf(progress, activity)
  const lv = levelInfo(xp)
  const next = nextConcept(course, progress)
  const cw = currentWeek(course, progress)
  const due = dueCards(srs, (id) => !!progress[id]?.learnedAt).length
  const term = termOfDay(course)
  const today = todayISO()
  const [sat, sun] = upcomingWeekend(today)
  const wkItems = plan.filter((p) => p.date === sat || p.date === sun)
  const wkDone = wkItems.filter((p) => progress[p.conceptId]?.learnedAt).length
  const wkMin = wkItems.reduce((a, p) => a + effort(course.concepts[p.conceptId]?.minutes ?? 0, settings), 0)
  const earned = useMemo(
    () => badges({ course, progress, activity, savedCount: Object.keys(saved).length, packCount: packs.length, weekBest }),
    [course, progress, activity, saved, packs, weekBest],
  )
  const name = settings.name.trim()

  useReveal(ref, [])
  useGSAP(
    () => {
      if (reduced()) return
      gsap.from('[data-word]', { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power4.out', delay: 0.1 })
    },
    { scope: ref },
  )

  const headline = total.done === 0 ? ['Become', 'fluent', 'in', 'AI.'] : ['Keep', 'the', 'momentum.']
  return (
    <div ref={ref} className="space-y-10">
      {/* hero */}
      <section className="card relative overflow-hidden min-h-[430px] sm:min-h-[400px] p-6 sm:p-10 flex flex-col justify-end" data-reveal>
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-y-0 right-0 w-full sm:w-[62%] opacity-90 sm:opacity-100">
          <Suspense fallback={null}>
            <Hero3D progress={total.pct} />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/85 via-[var(--bg)]/25 to-transparent sm:bg-gradient-to-r sm:from-[var(--bg)]/90 sm:via-[var(--bg)]/35 sm:to-transparent" />
        <div className="relative max-w-xl">
          <div className="chip chip-accent mb-4"><Sparkles size={12} /> {greet()}{name ? `, ${name}` : ''}</div>
          <h1 className="text-[2.6rem] sm:text-6xl font-bold leading-[1.02] mb-4 overflow-hidden">
            {headline.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-3">
                <span data-word className={clsx('inline-block', i === headline.length - 1 && 'text-gradient')}>{w}</span>
              </span>
            ))}
          </h1>
          <p className="text-muted text-base sm:text-lg mb-6 max-w-md">
            {total.done === 0
              ? 'The complete vocabulary of AI, vibe-coding, full-stack and design — one week at a time.'
              : `${total.done} of ${total.total} concepts learned. ${next ? `Up next: ${next.title}.` : 'You finished the whole course — add more material from Import!'}`}
          </p>
          <div className="flex flex-wrap gap-3">
            {next && (
              <button className="btn btn-primary" onClick={() => nav(`/concept/${next.id}`)}>
                <Play size={16} className="fill-current" /> {total.done === 0 ? 'Start learning' : 'Continue'}
              </button>
            )}
            <Link to="/plan" className="btn"><CalendarCheck2 size={16} /> Plan my weekend</Link>
          </div>
        </div>
      </section>

      {/* stat tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Flame, label: 'Day streak', node: <Counter value={st.current} />, sub: st.best ? `Best ${st.best}` : 'Learn today to start', color: 'var(--warn)' },
          { icon: Trophy, label: `Level ${lv.level}`, node: <Counter value={xp} className="tabular-nums" />, sub: `${lv.title} · ${lv.ceil - xp} XP to next`, color: 'var(--brand)' },
          { icon: Target, label: 'Learned', node: <><Counter value={total.done} /><span className="text-faint text-xl">/{total.total}</span></>, sub: `${Math.round(total.pct * 100)}% of the course`, color: 'var(--good)' },
          { icon: Layers, label: 'Reviews due', node: <Counter value={due} />, sub: due ? 'Keep it fresh' : 'All caught up', color: 'var(--brand-2)', to: '/review' },
        ].map((t) => {
          const body = (
            <div className="card p-4 sm:p-5 h-full" data-reveal>
              <div className="flex items-center gap-2 text-muted text-xs font-semibold uppercase tracking-wider">
                <t.icon size={14} style={{ color: t.color }} /> {t.label}
              </div>
              <div className="font-display text-4xl font-bold mt-2 leading-none">{t.node}</div>
              <div className="text-xs text-muted mt-2">{t.sub}</div>
            </div>
          )
          return t.to ? <Link key={t.label} to={t.to}>{body}</Link> : <div key={t.label}>{body}</div>
        })}
      </section>

      {/* weekend goal + term of the day */}
      <section className="grid lg:grid-cols-5 gap-4">
        <div className="card p-6 lg:col-span-3 relative overflow-hidden" data-reveal>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-brand/25 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Ring value={wkItems.length ? wkDone / wkItems.length : 0} size={96} stroke={9} color="#8b5cf6" color2="#22d3ee">
              <div className="text-center leading-none">
                <div className="font-display text-2xl font-bold">{wkDone}<span className="text-faint text-base">/{wkItems.length}</span></div>
              </div>
            </Ring>
            <div className="min-w-0">
              <div className="eyebrow mb-1">{dayName(sat)} – {dayName(sun)} goal</div>
              <h3 className="font-display text-xl font-semibold">{wkItems.length ? `${wkItems.length} concepts · ${fmtMin(wkMin)} planned` : 'No weekend goal yet'}</h3>
              <p className="text-sm text-muted mt-1">
                {wkItems.length ? 'Tick them off as you learn — the ring fills up.' : `You have ${fmtMin(settings.weekendMin)} per weekend day. Let’s fill it.`}
              </p>
              <Link to="/plan" className="btn btn-sm mt-3">{wkItems.length ? 'Open planner' : 'Set weekend goal'} <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
        {term && (
          <button
            data-reveal
            onClick={() => setFlipped((f) => !f)}
            className="card lg:col-span-2 p-6 text-left relative overflow-hidden group"
            aria-label="Term of the day"
          >
            <div className="eyebrow mb-2 flex items-center gap-1.5"><Lightbulb size={13} className="text-warn" /> Term of the day</div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{term.emoji}</span>
              <div className="font-display text-xl font-semibold leading-tight">{term.title}</div>
            </div>
            <p className={clsx('text-sm mt-3 transition-all duration-500', flipped ? 'text-ink' : 'text-muted blur-[5px] select-none')}>{term.tldr}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-faint">{flipped ? '' : 'Tap to reveal'}</span>
              {flipped && <Link to={`/concept/${term.id}`} className="text-sm font-semibold text-brand2 inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>Learn more <ArrowRight size={14} /></Link>}
            </div>
          </button>
        )}
      </section>

      {/* this week */}
      {cw && (
        <section>
          <SectionTitle eyebrow="Continue where you left off" title="Your current week" right={<Link to="/roadmap" className="text-sm font-semibold text-brand2">All weeks →</Link>} />
          <div className="grid md:grid-cols-2 gap-4" data-reveal>
            <WeekCard week={cw} />
            <div className="card p-5 flex flex-col justify-center gap-3">
              <div className="eyebrow">Course progress</div>
              {course.months.map((m) => {
                const ms = monthStats(course, progress, m.id)
                return (
                  <div key={m.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{m.emoji} Month {m.index} · {m.title}</span>
                      <span className="text-muted tabular-nums">{ms.done}/{ms.total}</span>
                    </div>
                    <Bar value={ms.pct} color={`linear-gradient(90deg, ${accent(260 + m.index * 25)}, ${accent(190 + m.index * 25)})`} />
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* activity + badges */}
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6" data-scroll>
          <div className="eyebrow mb-4">Last 15 weeks</div>
          <Heatmap />
        </div>
        <div className="card p-6" data-scroll>
          <div className="flex items-center justify-between mb-4">
            <div className="eyebrow">Achievements</div>
            <span className="text-xs text-muted">{earned.filter((b) => b.earned).length}/{earned.length}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {earned.map((b) => (
              <div key={b.id} className="flex flex-col items-center text-center gap-1" title={`${b.title} — ${b.desc}${b.progress ? ` (${b.progress})` : ''}`}>
                <div className={clsx('w-12 h-12 rounded-2xl grid place-items-center text-2xl border transition-all', b.earned ? 'bg-brand/15 border-brand/40 shadow-[0_0_22px_-4px_var(--brand)]' : 'bg-surface border-line grayscale opacity-40')}>
                  {b.emoji}
                </div>
                <div className="text-[10px] leading-tight text-muted font-semibold">{b.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* tracks teaser + import CTA */}
      <section className="card p-6 sm:p-8 relative overflow-hidden" data-scroll>
        <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(60% 120% at 100% 0%, rgba(34,211,238,.18), transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="text-5xl">📥</div>
          <div className="flex-1">
            <h3 className="font-display text-xl font-semibold">Found a new topic? Grow the course.</h3>
            <p className="text-muted text-sm mt-1">Drop in a PDF, Markdown or JSON file — new concepts join your roadmap, and matching ones update in place. Works offline.</p>
          </div>
          <Link to="/import" className="btn btn-primary"><Download size={16} /> Import material</Link>
        </div>
        <div className="relative flex flex-wrap gap-2 mt-5">
          {Object.entries(TRACKS).filter(([k]) => k !== 'custom').map(([k, t]) => (
            <span key={k} className="chip" style={{ color: accent(t.hue), borderColor: `${accent(t.hue)}40` }}>{t.label}</span>
          ))}
        </div>
      </section>
    </div>
  )
}
