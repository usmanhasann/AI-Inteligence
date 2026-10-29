import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarPlus, Check, Clock, FlaskConical, Swords } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../lib/course.ts'
import { useStore, toast } from '../lib/store.ts'
import { TRACKS, accent } from '../lib/tracks.ts'
import { weekStats } from '../lib/stats.ts'
import { autoPlan } from '../lib/plan.ts'
import { addDays, todayISO } from '../lib/dates.ts'
import { confetti, useReveal } from '../lib/motion.ts'
import { Md, Modal, Ring } from '../components/ui.tsx'
import { SaveButton } from '../components/cards.tsx'
import { Quiz } from '../components/Quiz.tsx'
import type { QuizQ } from '../lib/types.ts'

function shuffle<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export default function WeekPage() {
  const { id = '' } = useParams()
  const course = useCourse()
  const nav = useNavigate()
  const { progress, plan, settings, weekBest, addPlanMany, recordWeekQuiz } = useStore()
  const week = course.weekById[id]
  const ref = useRef<HTMLDivElement>(null)
  const [boss, setBoss] = useState<QuizQ[] | null>(null)
  useReveal(ref, [id])

  const questions = useMemo(
    () => (week ? week.concepts.flatMap((c) => (course.concepts[c]?.quiz ?? []).map((q) => q)) : []),
    [week, course],
  )
  if (!week) return <div className="card p-10 text-center">Week not found. <Link to="/roadmap" className="text-brand2">Back to roadmap</Link></div>

  const hue = TRACKS[week.track].hue
  const st = weekStats(course, progress, week.id)
  const month = course.months.find((m) => m.id === week.monthId)
  const prev = course.weeks[course.weeks.findIndex((w) => w.id === week.id) - 1]
  const next = course.weeks[course.weeks.findIndex((w) => w.id === week.id) + 1]
  const best = weekBest[week.id]

  const planWeek = () => {
    const today = todayISO()
    const days = Array.from({ length: 21 }, (_, i) => addDays(today, i))
    const only = { ...course, order: week.concepts }
    const items = autoPlan({ course: only, learned: (c) => !!progress[c]?.learnedAt, plan, days, settings, today })
    if (!items.length) return toast('Everything in this week is already planned or learned', 'info')
    addPlanMany(items)
    toast(`Scheduled ${items.length} concepts into your planner`, 'good')
    nav('/plan')
  }

  return (
    <div ref={ref} style={{ '--accent': accent(hue) } as CSSProperties}>
      <Link to="/roadmap" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-5" data-reveal><ArrowLeft size={15} /> Roadmap</Link>

      <header className="card p-6 sm:p-9 relative overflow-hidden mb-8" data-reveal>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: accent(hue) }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="eyebrow mb-2" style={{ color: accent(hue) }}>{month ? `Month ${month.index} · ` : ''}Week {week.index} · {TRACKS[week.track].label}</div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-3">{week.emoji} {week.title}</h1>
            <p className="text-muted">{week.subtitle}</p>
            <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
              <div className="eyebrow mb-1">By the end of this week</div>
              <p className="text-[0.95rem]">{week.outcome}</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <button className="btn btn-primary" onClick={planWeek}><CalendarPlus size={16} /> Schedule this week</button>
              <button className="btn" onClick={() => setBoss(shuffle(questions).slice(0, Math.min(8, questions.length)))} disabled={!questions.length}>
                <Swords size={16} /> Week challenge{best !== undefined && <span className="text-good ml-1">{Math.round(best * 100)}%</span>}
              </button>
            </div>
          </div>
          <Ring value={st.pct} size={130} stroke={11} color={accent(hue, 62)} color2={accent(hue + 50, 70)}>
            <div className="text-center leading-none">
              <div className="font-display text-3xl font-bold">{st.done}<span className="text-faint text-lg">/{st.total}</span></div>
              <div className="text-[11px] text-muted mt-1">learned</div>
            </div>
          </Ring>
        </div>
      </header>

      {/* concept path */}
      <div className="relative">
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 rounded-full" style={{ background: `linear-gradient(${accent(hue)}, transparent)`, opacity: 0.35 }} />
        <ol className="space-y-4">
          {week.concepts.map((cid, i) => {
            const c = course.concepts[cid]
            if (!c) return null
            const done = !!progress[cid]?.learnedAt
            const current = !done && week.concepts.slice(0, i).every((p) => progress[p]?.learnedAt)
            return (
              <li key={cid} className="relative flex gap-4" data-reveal>
                <div
                  className={clsx('z-10 w-14 h-14 rounded-2xl grid place-items-center text-2xl shrink-0 border-2 bg-solid transition-all', current && 'pulse-ring')}
                  style={{ borderColor: done ? 'var(--good)' : current ? accent(hue) : 'var(--border-strong)' }}
                >
                  {done ? <Check className="text-good" strokeWidth={3} /> : c.emoji}
                </div>
                <Link to={`/concept/${cid}`} className="card card-hover flex-1 min-w-0 p-4 sm:p-5 block">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-lg">{c.title}</h3>
                        {current && <span className="chip chip-accent">Next up</span>}
                        {c.lab && <span className="chip chip-accent"><FlaskConical size={11} /> Lab</span>}
                      </div>
                      <Md className="text-sm !text-muted mt-1 [&_p]:!text-muted">{c.tldr}</Md>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="chip"><Clock size={11} /> {c.minutes} min</span>
                        {progress[cid]?.quizBest !== undefined && <span className="chip">Quiz {Math.round((progress[cid].quizBest ?? 0) * 100)}%</span>}
                      </div>
                    </div>
                    <SaveButton id={cid} size="sm" />
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex justify-between gap-3 mt-10">
        {prev ? <Link to={`/week/${prev.id}`} className="btn"><ArrowLeft size={15} /> Week {prev.index}</Link> : <span />}
        {next && <Link to={`/week/${next.id}`} className="btn">Week {next.index}: {next.title} →</Link>}
      </div>

      <Modal open={!!boss} onClose={() => setBoss(null)} title="Week challenge">
        {boss && (
          <div>
            <div className="flex items-center gap-2 mb-4"><Swords size={18} className="text-brand2" /><h3 className="font-display text-xl font-semibold">Week {week.index} challenge</h3></div>
            <Quiz
              questions={boss}
              label="Mixed review"
              onDone={(s) => {
                recordWeekQuiz(week.id, s)
                if (s >= 0.8) confetti()
              }}
            />
            <button className="btn btn-ghost w-full mt-3" onClick={() => setBoss(null)}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
