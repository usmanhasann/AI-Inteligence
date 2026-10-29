import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCw } from 'lucide-react'
import { useCourse } from '../lib/course.ts'
import { useStore } from '../lib/store.ts'
import { dueCards } from '../lib/stats.ts'
import { confetti, gsap, reduced, useGSAP } from '../lib/motion.ts'
import { haptic } from '../lib/platform.ts'
import { Bar, Empty, Md } from '../components/ui.tsx'

const GRADES = [
  { g: 0 as const, label: 'Again', hint: 'Forgot', color: 'var(--bad)' },
  { g: 1 as const, label: 'Hard', hint: 'Barely', color: 'var(--warn)' },
  { g: 2 as const, label: 'Good', hint: 'Got it', color: 'var(--brand-2)' },
  { g: 3 as const, label: 'Easy', hint: 'Instant', color: 'var(--good)' },
]

export default function Review() {
  const course = useCourse()
  const { srs, progress, review } = useStore()
  const learned = (id: string) => !!progress[id]?.learnedAt
  const initial = useMemo(() => dueCards(srs, learned), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [practice, setPractice] = useState(false)
  const deck = useMemo(() => (practice ? course.order.filter(learned).sort(() => Math.random() - 0.5).slice(0, 15) : initial), [practice, initial]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const [score, setScore] = useState(0)
  const card = useRef<HTMLDivElement>(null)
  const id = deck[i]
  const c = id ? course.concepts[id] : undefined
  const nextDue = Object.entries(srs).filter(([k]) => learned(k)).map(([, s]) => s.due).sort()[0]

  useGSAP(
    () => {
      if (!card.current) return
      if (reduced()) { gsap.set(card.current, { rotationY: flip ? 180 : 0 }); return }
      gsap.to(card.current, { rotationY: flip ? 180 : 0, duration: 0.7, ease: 'back.out(1.2)' })
    },
    { dependencies: [flip] },
  )
  useGSAP(
    () => {
      if (!card.current || reduced()) return
      gsap.fromTo(card.current.parentElement, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
    },
    { dependencies: [i] },
  )

  useEffect(() => {
    if (deck.length && i === deck.length) confetti()
  }, [i, deck.length])

  if (!deck.length || i >= deck.length) {
    const finished = deck.length > 0
    return (
      <div className="max-w-xl mx-auto">
        <Empty emoji={finished ? '🏆' : Object.keys(srs).length ? '✅' : '🌱'} title={finished ? `Session complete — ${score}/${deck.length} recalled` : Object.keys(srs).length ? 'Nothing due right now' : 'No cards yet'}>
          {finished
            ? 'Spaced repetition works because you did that. Come back tomorrow.'
            : Object.keys(srs).length
              ? nextDue ? `Your next card is due ${new Date(nextDue).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}.` : 'You are all caught up.'
              : 'Mark concepts as learned and they appear here on a spaced-repetition schedule (1, 2, 4, 9, 21 days).'}
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            {!practice && course.order.some(learned) && <button className="btn btn-primary" onClick={() => { setPractice(true); setI(0); setScore(0); setFlip(false) }}>Practice anyway</button>}
            <Link to="/roadmap" className="btn">Learn something new</Link>
          </div>
        </Empty>
      </div>
    )
  }

  const grade = (g: 0 | 1 | 2 | 3) => {
    void haptic('light')
    if (!practice) review(id, g)
    if (g >= 2) setScore((s) => s + 1)
    setFlip(false)
    setI((n) => n + 1)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <div className="eyebrow mb-1">{practice ? 'Practice' : 'Spaced repetition'}</div>
        <div className="flex items-end justify-between"><h1 className="text-4xl font-bold">Review</h1><span className="text-muted tabular-nums">{i + 1} / {deck.length}</span></div>
        <Bar value={i / deck.length} className="mt-3" />
      </div>
      <div style={{ perspective: 1200 }}>
        <div className="relative">
          <div
            ref={card}
            role="button"
            tabIndex={0}
            aria-label="Flip card"
            onClick={() => setFlip((f) => !f)}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), setFlip((f) => !f))}
            className="relative min-h-[360px] cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="card absolute inset-0 p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
              <div className="text-7xl mb-5 float">{c?.emoji}</div>
              <div className="eyebrow mb-2">Explain in your own words</div>
              <h2 className="text-3xl sm:text-4xl font-bold">{c?.title}</h2>
              <div className="absolute bottom-5 flex items-center gap-1.5 text-xs text-faint"><RotateCw size={12} /> tap to reveal</div>
            </div>
            <div className="card absolute inset-0 p-6 sm:p-8 overflow-auto flex flex-col justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'var(--surface-solid)' }}>
              <div className="eyebrow mb-2 text-brand2">{c?.title}</div>
              <p className="font-display text-xl font-semibold leading-snug mb-3">{c?.tldr}</p>
              {c?.analogy && <Md className="text-sm [&_p]:!text-muted">{c.analogy}</Md>}
              <Link to={`/concept/${id}`} onClick={(e) => e.stopPropagation()} className="text-sm text-brand2 font-semibold mt-3">Open full concept →</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2.5 mt-6" style={{ opacity: flip ? 1 : 0.35, pointerEvents: flip ? 'auto' : 'none', transition: 'opacity .3s' }}>
        {GRADES.map((g) => (
          <button key={g.g} className="btn flex-col !h-16 !gap-0" onClick={() => grade(g.g)} style={{ borderColor: `color-mix(in oklab, ${g.color} 50%, transparent)` }}>
            <span style={{ color: g.color }}>{g.label}</span><span className="text-[10px] text-muted font-normal">{g.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
