import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SliderField, Seg } from '../components/Fields.tsx'

const TEXT = `Orbit Pro is our subscription for teams. It includes unlimited projects, priority support and shared workspaces.

Billing happens on the first day of each cycle. Monthly plans renew automatically unless cancelled before the billing date.

Annual plans can be refunded within 30 days of purchase, but only if fewer than five projects have been exported. After 30 days the plan is non-refundable, although you may transfer it to another teammate.

Support is available by chat from 9am to 6pm on weekdays. Pro customers get a response within four hours, and urgent outages are handled around the clock.

You can export your data at any time as JSON or CSV. Exports include projects, comments and activity history, and they never expire.`

const ANSWER = 'Annual plans can be refunded within 30 days of purchase, but only if fewer than five projects have been exported.'
const COLORS = [264, 190, 330, 150, 35, 215, 355, 100]

type Strategy = 'fixed' | 'sentence' | 'paragraph'

function chunk(words: string[], strategy: Strategy, size: number, overlap: number): [number, number][] {
  const spans: [number, number][] = []
  if (strategy === 'fixed') {
    const step = Math.max(1, size - overlap)
    for (let s = 0; s < words.length; s += step) {
      spans.push([s, Math.min(words.length, s + size)])
      if (s + size >= words.length) break
    }
  } else if (strategy === 'paragraph') {
    let i = 0
    for (const p of TEXT.split(/\n\n+/)) { const n = p.split(/\s+/).filter(Boolean).length; spans.push([i, i + n]); i += n }
  } else {
    // pack whole sentences up to `size` words
    const sentences: [number, number][] = []
    let i = 0
    let start = 0
    for (const w of words) { i++; if (/[.!?]$/.test(w)) { sentences.push([start, i]); start = i } }
    if (start < words.length) sentences.push([start, words.length])
    let cur: [number, number] | null = null
    for (const s of sentences) {
      if (cur && s[1] - cur[0] > size) { spans.push(cur); cur = null }
      cur = cur ? [cur[0], s[1]] : s
    }
    if (cur) spans.push(cur)
  }
  return spans
}

export default function Chunking() {
  const [strategy, setStrategy] = useState<Strategy>('fixed')
  const [size, setSize] = useState(40)
  const [overlap, setOverlap] = useState(0)

  const words = useMemo(() => TEXT.split(/\s+/).filter(Boolean), [])
  const spans = useMemo(() => chunk(words, strategy, size, Math.min(overlap, size - 1)), [words, strategy, size, overlap])
  const aStart = useMemo(() => { const aw = ANSWER.split(/\s+/); for (let i = 0; i < words.length; i++) if (words.slice(i, i + aw.length).join(' ') === ANSWER) return [i, i + aw.length] as const; return [0, 0] as const }, [words])
  const whole = spans.some(([s, e]) => s <= aStart[0] && e >= aStart[1])
  const avg = Math.round(spans.reduce((a, [s, e]) => a + (e - s), 0) / Math.max(1, spans.length))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <Seg value={strategy} onChange={setStrategy} options={[{ v: 'fixed', label: 'Fixed size' }, { v: 'sentence', label: 'By sentence' }, { v: 'paragraph', label: 'By paragraph' }]} />
      </div>
      {strategy !== 'paragraph' && (
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          <SliderField label={strategy === 'fixed' ? 'Chunk size' : 'Max chunk size'} value={size} min={10} max={120} step={5} unit="words" onChange={setSize} />
          {strategy === 'fixed' && <SliderField label="Overlap" value={Math.min(overlap, size - 1)} min={0} max={Math.min(60, size - 1)} step={5} unit="words" onChange={setOverlap} />}
        </div>
      )}

      <div className="flex h-5 rounded-lg overflow-hidden border border-line" aria-hidden>
        {spans.map(([s, e], i) => <div key={i} style={{ width: `${((e - s) / words.length) * 100}%`, background: `hsl(${COLORS[i % 8]} 80% 60% / .75)`, borderRight: '1px solid var(--bg)' }} />)}
      </div>

      <div className="rounded-2xl border border-line p-4 text-[0.93rem] leading-8" style={{ background: 'rgba(0,0,0,.22)' }}>
        {words.map((w, i) => {
          const owners = spans.map((sp, k) => (i >= sp[0] && i < sp[1] ? k : -1)).filter((k) => k >= 0)
          const first = owners[0] ?? 0
          const inAnswer = i >= aStart[0] && i < aStart[1]
          return (
            <span key={i} className="px-[2px] rounded-sm" style={{ background: `hsl(${COLORS[first % 8]} 80% 60% / .22)`, boxShadow: owners.length > 1 ? `inset 0 -3px 0 hsl(${COLORS[owners[1] % 8]} 85% 62%)` : undefined, color: inAnswer ? 'var(--warn)' : undefined, fontWeight: inAnswer ? 700 : undefined }}>
              {w}{' '}
            </span>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[['Chunks', spans.length], ['Avg size', `${avg}w`], ['Overlap', strategy === 'fixed' ? `${Math.min(overlap, size - 1)}w` : '—']].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-surface border border-line py-3"><div className="font-display text-2xl font-bold">{v}</div><div className="text-xs text-muted">{l}</div></div>
        ))}
      </div>

      <div className="rounded-2xl p-4 border flex gap-3 text-sm" style={{ borderColor: whole ? 'color-mix(in oklab, var(--good) 50%, transparent)' : 'color-mix(in oklab, var(--warn) 55%, transparent)', background: whole ? 'color-mix(in oklab, var(--good) 8%, transparent)' : 'color-mix(in oklab, var(--warn) 9%, transparent)' }}>
        {whole ? <CheckCircle2 className="text-good shrink-0" size={20} /> : <AlertTriangle className="text-warn shrink-0" size={20} />}
        <div>
          <b>Question: “Can I get a refund on an annual plan?”</b><br />
          {whole ? 'The highlighted answer sentence sits inside a single chunk — retrieval can return it intact.' : 'The answer sentence is cut across chunk boundaries. Retrieval may return half of the rule (or miss the “fewer than five projects” condition). Try more overlap, a bigger chunk, or sentence-aware chunking.'}
        </div>
      </div>
    </div>
  )
}
