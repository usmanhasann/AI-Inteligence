import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Check, Clock, FlaskConical } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../lib/course.ts'
import { useStore, toast } from '../lib/store.ts'
import { TRACKS, accent, trackAccent } from '../lib/tracks.ts'
import { weekStats } from '../lib/stats.ts'
import { gsap, reduced, useTilt } from '../lib/motion.ts'
import { haptic } from '../lib/platform.ts'
import type { Concept, Week } from '../lib/types.ts'
import { Ring } from './ui.tsx'

export function SaveButton({ id, size = 'md', label }: { id: string; size?: 'sm' | 'md'; label?: boolean }) {
  const saved = useStore((s) => !!s.saved[id])
  const toggle = useStore((s) => s.toggleSaved)
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <button
      ref={ref}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from gallery' : 'Save to gallery'}
      className={clsx('btn', size === 'sm' ? 'btn-sm' : '', label ? '' : size === 'sm' ? 'btn-icon btn-sm' : 'btn-icon')}
      style={saved ? { color: 'var(--warn)', borderColor: 'color-mix(in oklab, var(--warn) 45%, transparent)', background: 'color-mix(in oklab, var(--warn) 12%, transparent)' } : undefined}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
        void haptic('light')
        toast(saved ? 'Removed from gallery' : 'Saved to your gallery ⭐', saved ? 'info' : 'good')
        if (!saved && !reduced() && ref.current) gsap.fromTo(ref.current.querySelector('svg'), { scale: 0.4, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1.2,0.5)' })
      }}
    >
      <Bookmark size={size === 'sm' ? 15 : 18} className={saved ? 'fill-current' : ''} />
      {label && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}

export function ConceptCard({ concept, index, showWeek = false }: { concept: Concept; index?: number; showWeek?: boolean }) {
  const course = useCourse()
  const learned = useStore((s) => !!s.progress[concept.id]?.learnedAt)
  const week = course.weekById[course.weekOf[concept.id]]
  const hue = week ? TRACKS[week.track].hue : 265
  const tilt = useTilt<HTMLAnchorElement>(6)
  return (
    <Link
      ref={tilt}
      to={`/concept/${concept.id}`}
      className="card card-hover relative block p-4 sm:p-5 overflow-hidden group will-change-transform"
      style={{ '--accent': accent(hue) } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `radial-gradient(240px circle at var(--mx,50%) var(--my,0%), ${accent(hue)}22, transparent 70%)` }}
      />
      <div className="relative flex items-start gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl grid place-items-center text-2xl shrink-0 border"
          style={{ background: `${accent(hue)}1a`, borderColor: `${accent(hue)}40` }}
        >
          {concept.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {index !== undefined && <span className="text-[11px] font-bold text-faint tabular-nums">{String(index + 1).padStart(2, '0')}</span>}
            <h3 className="font-display font-semibold text-[1.05rem] leading-snug truncate">{concept.title}</h3>
          </div>
          <p className="text-sm text-muted mt-1 line-clamp-2">{concept.tldr}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="chip"><Clock size={11} /> {concept.minutes} min</span>
            {concept.lab && <span className="chip chip-accent"><FlaskConical size={11} /> Lab</span>}
            {showWeek && week && <span className="chip">W{week.index}</span>}
            {concept.updated && <span className="chip" style={{ color: 'var(--good)' }}>updated</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {learned ? (
            <span className="w-7 h-7 rounded-full grid place-items-center bg-good/20 text-good border border-good/40"><Check size={15} strokeWidth={3} /></span>
          ) : (
            <span className="w-7 h-7 rounded-full border border-line2" />
          )}
          <SaveButton id={concept.id} size="sm" />
        </div>
      </div>
    </Link>
  )
}

export function WeekCard({ week }: { week: Week }) {
  const course = useCourse()
  const progress = useStore((s) => s.progress)
  const st = weekStats(course, progress, week.id)
  const hue = TRACKS[week.track].hue
  const tilt = useTilt<HTMLAnchorElement>(5)
  return (
    <Link
      ref={tilt}
      to={`/week/${week.id}`}
      className="card card-hover block p-5 relative overflow-hidden group"
      style={{ '--accent': accent(hue) } as CSSProperties}
    >
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-25 group-hover:opacity-50 transition-opacity" style={{ background: accent(hue) }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow mb-1" style={{ color: accent(hue) }}>Week {week.index} · {TRACKS[week.track].label}</div>
          <h3 className="font-display text-xl font-semibold">{week.emoji} {week.title}</h3>
          <p className="text-sm text-muted mt-1.5 line-clamp-2">{week.subtitle}</p>
        </div>
        <Ring value={st.pct} size={58} stroke={6} color={accent(hue, 62)} color2={accent(hue + 40, 70)}>
          <span className="text-xs font-bold tabular-nums">{Math.round(st.pct * 100)}%</span>
        </Ring>
      </div>
      <div className="relative flex items-center gap-2 mt-4 text-xs text-muted">
        <span className="chip">{st.done}/{st.total} concepts</span>
        <span className="chip"><Clock size={11} /> ~{Math.round(st.minutesLeft / 5) * 5 || st.minutesLeft} min left</span>
      </div>
    </Link>
  )
}

export { trackAccent }
