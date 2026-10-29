import { useRef, useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import clsx from 'clsx'
import type { QuizQ } from '../lib/types.ts'
import { confetti, gsap, reduced, useGSAP } from '../lib/motion.ts'
import { haptic } from '../lib/platform.ts'
import { Md } from './ui.tsx'

/** One question at a time, instant feedback with the explanation, final score. */
export function Quiz({ questions, onDone, label = 'Quick check' }: { questions: QuizQ[]; onDone?: (score: number) => void; label?: string }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [right, setRight] = useState(0)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const q = questions[i]

  useGSAP(
    () => {
      if (reduced() || !ref.current) return
      gsap.from(ref.current.querySelectorAll('[data-opt]'), { y: 14, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', clearProps: 'all' })
    },
    { scope: ref, dependencies: [i, done] },
  )

  if (!questions.length) return null

  const choose = (n: number) => {
    if (picked !== null) return
    setPicked(n)
    const ok = n === q.answer
    if (ok) setRight((r) => r + 1)
    void haptic(ok ? 'success' : 'light')
    if (!reduced() && ref.current) {
      const el = ref.current.querySelector<HTMLElement>(`[data-opt="${n}"]`)
      if (el) {
        if (ok) gsap.fromTo(el, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.4,0.5)' })
        else gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.6,0.3)' })
      }
    }
  }
  const advance = () => {
    if (i + 1 < questions.length) {
      setI(i + 1)
      setPicked(null)
    } else {
      setDone(true)
      const score = right / questions.length
      onDone?.(score)
      if (score >= 1) confetti(window.innerWidth / 2, window.innerHeight * 0.45, 90)
    }
  }
  const restart = () => {
    setI(0)
    setPicked(null)
    setRight(0)
    setDone(false)
  }

  if (done) {
    const score = right / questions.length
    return (
      <div ref={ref} className="text-center py-4">
        <div className="text-5xl mb-2" data-opt>{score >= 1 ? '🎯' : score >= 0.5 ? '👏' : '🔁'}</div>
        <div className="font-display text-2xl font-bold" data-opt>{right}/{questions.length} correct</div>
        <p className="text-muted text-sm mt-1 mb-4" data-opt>
          {score >= 1 ? 'Flawless. That one is locked in.' : score >= 0.5 ? 'Solid. Re-read the explanations you missed.' : 'No stress — revisit the concept and try again.'}
        </p>
        <button className="btn" onClick={restart} data-opt><RotateCcw size={15} /> Try again</button>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow">{label}</div>
        <div className="flex gap-1.5">
          {questions.map((_, n) => (
            <span key={n} className="h-1.5 rounded-full transition-all" style={{ width: n === i ? 22 : 8, background: n < i || (n === i && picked !== null) ? 'var(--brand)' : 'var(--surface-2)' }} />
          ))}
        </div>
      </div>
      <h4 className="font-display text-lg font-semibold mb-4 leading-snug">{q.q}</h4>
      <div className="grid gap-2.5">
        {q.options.map((o, n) => {
          const state = picked === null ? 'idle' : n === q.answer ? 'right' : n === picked ? 'wrong' : 'dim'
          return (
            <button
              key={n}
              data-opt={n}
              onClick={() => choose(n)}
              disabled={picked !== null}
              className={clsx(
                'text-left px-4 py-3 rounded-2xl border transition-all flex items-start gap-3 min-h-[52px]',
                state === 'idle' && 'bg-surface border-line hover:border-brand hover:bg-surface2',
                state === 'right' && 'border-good bg-good/10',
                state === 'wrong' && 'border-bad bg-bad/10',
                state === 'dim' && 'opacity-45 border-line',
              )}
            >
              <span
                className={clsx('mt-0.5 w-6 h-6 rounded-full grid place-items-center text-xs font-bold shrink-0 border', state === 'right' ? 'bg-good text-black border-good' : state === 'wrong' ? 'bg-bad text-black border-bad' : 'border-line2 text-muted')}
              >
                {state === 'right' ? <Check size={14} strokeWidth={3} /> : state === 'wrong' ? <X size={14} strokeWidth={3} /> : String.fromCharCode(65 + n)}
              </span>
              <span className="text-[0.95rem]">{o}</span>
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 rounded-2xl p-4 border border-line bg-surface" data-opt>
          <div className={clsx('text-sm font-bold mb-1', picked === q.answer ? 'text-good' : 'text-bad')}>{picked === q.answer ? 'Correct!' : 'Not quite.'}</div>
          <Md className="text-sm">{q.why}</Md>
          <button className="btn btn-primary btn-sm mt-3" onClick={advance}>{i + 1 < questions.length ? 'Next question' : 'See result'}</button>
        </div>
      )}
    </div>
  )
}
