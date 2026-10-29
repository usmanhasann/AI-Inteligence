import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Seg } from '../components/Fields.tsx'

interface Sentence {
  label: string
  tokens: string[]
  /** reference-head links: from -> [to, weight][] */
  links: Record<number, [number, number][]>
  start: number
  note: string
}

const SENTENCES: Sentence[] = [
  {
    label: 'The animal…tired',
    tokens: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'],
    links: { 7: [[1, 0.62], [10, 0.14]], 10: [[1, 0.35], [9, 0.2]], 3: [[5, 0.35], [1, 0.2]], 2: [[3, 0.35], [1, 0.2]], 5: [[3, 0.3], [4, 0.2]], 6: [[2, 0.2], [3, 0.2]] },
    start: 7,
    note: '“it” points back to “animal” — an animal gets tired, a street doesn’t.',
  },
  {
    label: '…too big',
    tokens: ['The', 'trophy', "doesn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'is', 'too', 'big'],
    links: { 8: [[1, 0.64], [11, 0.1]], 11: [[1, 0.35], [10, 0.2]], 3: [[1, 0.25], [6, 0.3]], 2: [[3, 0.4]], 6: [[4, 0.3], [3, 0.2]] },
    start: 8,
    note: 'With “too big”, “it” refers to the trophy.',
  },
  {
    label: '…too small',
    tokens: ['The', 'trophy', "doesn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'is', 'too', 'small'],
    links: { 8: [[6, 0.64], [11, 0.1]], 11: [[6, 0.35], [10, 0.2]], 3: [[1, 0.25], [6, 0.3]], 2: [[3, 0.4]], 6: [[4, 0.3], [3, 0.2]] },
    start: 8,
    note: 'Change ONE word (“big” → “small”) and “it” now refers to the suitcase. That’s what attention captures.',
  },
]

function rowWeights(s: Sentence, i: number, head: 'reference' | 'previous'): number[] {
  const n = s.tokens.length
  const w = Array(n).fill(0.015)
  w[i] += 0.04
  if (head === 'previous') {
    if (i > 0) w[i - 1] += 0.75
    else w[i] += 0.7
  } else {
    for (const [j, v] of s.links[i] ?? []) w[j] += v
    if (!s.links[i]) { if (i > 0) w[i - 1] += 0.25; w[i] += 0.2 }
  }
  const z = w.reduce((a, b) => a + b, 0)
  return w.map((x) => x / z)
}

export default function Attention() {
  const [si, setSi] = useState(0)
  const [sel, setSel] = useState(SENTENCES[0].start)
  const [head, setHead] = useState<'reference' | 'previous'>('reference')
  const s = SENTENCES[si]
  const wts = useMemo(() => rowWeights(s, sel, head), [s, sel, head])
  const wrap = useRef<HTMLDivElement>(null)
  const pills = useRef<(HTMLButtonElement | null)[]>([])
  const [arcs, setArcs] = useState<{ d: string; w: number; o: number; key: number }[]>([])

  useLayoutEffect(() => {
    const box = wrap.current?.getBoundingClientRect()
    if (!box) return
    const c = (i: number) => { const r = pills.current[i]?.getBoundingClientRect(); return r ? { x: r.left + r.width / 2 - box.left, y: r.top - box.top } : null }
    const from = c(sel)
    if (!from) return
    const out: typeof arcs = []
    wts.forEach((w, j) => {
      if (j === sel || w < 0.06) return
      const to = c(j)
      if (!to) return
      // arc rises above the words; control point is twice the visual height of a quadratic curve
      const rise = Math.min(112, 26 + Math.abs(to.x - from.x) * 0.3)
      const top = Math.min(from.y, to.y) - 4
      out.push({ key: j, d: `M ${from.x} ${from.y - 2} Q ${(from.x + to.x) / 2} ${top - rise * 2 + 8} ${to.x} ${to.y - 2}`, w: 1 + w * 9, o: 0.3 + w })
    })
    setArcs(out)
  }, [sel, wts, si, head])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Seg value={String(si)} onChange={(v) => { const n = Number(v); setSi(n); setSel(SENTENCES[n].start) }} options={SENTENCES.map((x, i) => ({ v: String(i), label: x.label }))} />
        <Seg value={head} onChange={setHead} options={[{ v: 'reference', label: 'Head A: meaning' }, { v: 'previous', label: 'Head B: previous word' }]} />
      </div>

      <div ref={wrap} className="relative rounded-2xl border border-line px-3 sm:px-5 pb-5 overflow-x-auto" style={{ background: 'rgba(0,0,0,.22)', paddingTop: 134 }}>
        <svg className="absolute left-0 top-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {arcs.map((a) => <path key={a.key} d={a.d} fill="none" stroke="url(#att)" strokeWidth={a.w} strokeLinecap="round" opacity={a.o} style={{ transition: 'all .4s' }} />)}
          <defs><linearGradient id="att" x1="0" x2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
        </svg>
        <div className="flex flex-wrap gap-x-1.5 gap-y-3 relative">
          {s.tokens.map((t, i) => (
            <button
              key={i}
              ref={(el) => { pills.current[i] = el }}
              onClick={() => setSel(i)}
              className={clsx('px-2.5 py-1.5 rounded-lg font-mono text-sm border transition-all', i === sel ? 'border-warn text-warn font-bold scale-110' : 'border-transparent')}
              style={{ background: i === sel ? 'rgba(251,191,36,.12)' : `rgba(139,92,246,${Math.min(0.85, wts[i] * 1.3 + 0.04)})`, color: i === sel ? undefined : 'var(--text)' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-start">
        <ul className="grid gap-1.5">
          {s.tokens.map((t, i) => ({ t, i, w: wts[i] })).sort((a, b) => b.w - a.w).slice(0, 5).map(({ t, i, w }) => (
            <li key={i} className="grid grid-cols-[84px_1fr_44px] items-center gap-2 text-sm">
              <span className="font-mono truncate">{t}</span>
              <div className="h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2 transition-all duration-500" style={{ width: `${w * 100}%` }} /></div>
              <span className="tabular-nums text-xs text-muted text-right">{(w * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted rounded-2xl border border-line bg-surface p-4">
          <b className="text-ink">Selected: “{s.tokens[sel]}”.</b> {head === 'reference' ? s.note : 'Some heads learn simple patterns, like “look at the previous word”. A transformer runs many heads in parallel and blends them.'}
        </p>
      </div>
      <p className="text-xs text-faint">Illustrative weights hand-set to show real behaviour; production models learn thousands of such patterns across many layers.</p>
    </div>
  )
}
