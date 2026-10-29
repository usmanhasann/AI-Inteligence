import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useCourse } from '../lib/course.ts'
import { useStore } from '../lib/store.ts'
import { monthStats, totalStats } from '../lib/stats.ts'
import { accent } from '../lib/tracks.ts'
import { useReveal } from '../lib/motion.ts'
import { Ring } from '../components/ui.tsx'
import { WeekCard } from '../components/cards.tsx'
import { Seg } from '../components/Fields.tsx'
import { fmtMin } from '../lib/plan.ts'

export default function Roadmap() {
  const course = useCourse()
  const progress = useStore((s) => s.progress)
  const [view, setView] = useState<'months' | 'weeks'>('months')
  const ref = useRef<HTMLDivElement>(null)
  const total = totalStats(course, progress)
  useReveal(ref, [view])
  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8" data-reveal>
        <div>
          <div className="eyebrow mb-1">The course</div>
          <h1 className="text-4xl sm:text-5xl font-bold">Your <span className="text-gradient">roadmap</span></h1>
          <p className="text-muted mt-2 max-w-xl">
            {course.weeks.length} weeks · {total.total} concepts · {fmtMin(course.order.reduce((a, id) => a + (course.concepts[id]?.minutes ?? 0), 0))} of focused learning. Go week by week, or jump anywhere.
          </p>
        </div>
        <Seg value={view} onChange={setView} options={[{ v: 'months', label: 'By month' }, { v: 'weeks', label: 'All weeks' }]} />
      </div>

      {view === 'weeks' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {course.weeks.map((w) => <div key={w.id} data-scroll><WeekCard week={w} /></div>)}
        </div>
      ) : (
        <div className="relative space-y-12">
          <div className="hidden md:block absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-brand/60 via-brand2/30 to-transparent" />
          {course.months.map((m) => {
            const ms = monthStats(course, progress, m.id)
            const hue = 250 + m.index * 28
            return (
              <section key={m.id} className="md:pl-[72px] relative">
                <div
                  className="hidden md:grid absolute left-0 top-0 w-14 h-14 rounded-2xl place-items-center text-2xl border bg-solid"
                  style={{ borderColor: `${accent(hue)}66`, boxShadow: `0 0 30px -6px ${accent(hue)}` }}
                  data-scroll
                >
                  {m.emoji}
                </div>
                <div className="flex items-center gap-4 mb-5" data-scroll>
                  <div className="md:hidden text-3xl">{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="eyebrow" style={{ color: accent(hue) }}>Month {m.index}</div>
                    <h2 className="text-2xl sm:text-3xl font-semibold">{m.title}</h2>
                    <p className="text-sm text-muted">{m.tagline}</p>
                  </div>
                  <Ring value={ms.pct} size={64} stroke={7} color={accent(hue)} color2={accent(hue + 60)}>
                    <span className="text-xs font-bold tabular-nums">{ms.done}/{ms.total}</span>
                  </Ring>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.weeksOfMonth(m.id).map((w) => <div key={w.id} data-scroll><WeekCard week={w} /></div>)}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <div className="card p-6 mt-12 flex flex-wrap items-center gap-4" data-scroll>
        <Clock className="text-brand2" />
        <div className="flex-1 min-w-[220px]">
          <div className="font-semibold">Short on weekdays? That’s the design.</div>
          <div className="text-sm text-muted">Use the planner to spread concepts across your real time budget — light weekdays, deep weekends.</div>
        </div>
        <Link to="/plan" className="btn btn-primary">Open planner</Link>
      </div>
    </div>
  )
}
