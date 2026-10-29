import { useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { gsap, reduced, useGSAP } from '../lib/motion.ts'
import { SliderField } from '../components/Fields.tsx'

const SIZES = [{ l: '8K', v: 8000 }, { l: '32K', v: 32000 }, { l: '128K', v: 128000 }, { l: '200K', v: 200000 }, { l: '1M', v: 1000000 }]

export default function ContextWindow() {
  const [size, setSize] = useState(32000)
  const [sys, setSys] = useState(1200)
  const [tools, setTools] = useState(2500)
  const [docs, setDocs] = useState(8000)
  const [turns, setTurns] = useState(10)
  const [out, setOut] = useState(4000)
  const bar = useRef<HTMLDivElement>(null)

  const hist = turns * 450
  const parts = [
    { k: 'System prompt', v: sys, c: '#8b5cf6' },
    { k: 'Tool definitions', v: tools, c: '#22d3ee' },
    { k: 'Retrieved docs', v: docs, c: '#34d399' },
    { k: 'Chat history', v: hist, c: '#fbbf24' },
    { k: 'Reserved for answer', v: out, c: '#f472b6' },
  ]
  const used = parts.reduce((a, p) => a + p.v, 0)
  const over = used - size
  const pct = Math.min(100, (used / size) * 100)
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : String(n))

  useGSAP(
    () => {
      if (!bar.current) return
      const kids = bar.current.querySelectorAll<HTMLElement>('[data-seg]')
      kids.forEach((el) => {
        const w = `${Math.min(100, (Number(el.dataset.seg) / Math.max(used, size)) * 100)}%`
        if (reduced()) gsap.set(el, { width: w })
        else gsap.to(el, { width: w, duration: 0.5, ease: 'power3.out' })
      })
    },
    { dependencies: [used, size] },
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Model window</span>
        {SIZES.map((s) => (
          <button key={s.l} className="chip hover:border-brand2" style={size === s.v ? { color: 'var(--brand-2)', borderColor: 'var(--brand-2)' } : undefined} onClick={() => setSize(s.v)}>{s.l}</button>
        ))}
      </div>

      <div>
        <div ref={bar} className="h-9 rounded-xl overflow-hidden flex border border-line" style={{ background: 'var(--surface-2)' }}>
          {parts.map((p) => <div key={p.k} data-seg={p.v} className="h-full" style={{ background: p.c, width: 0 }} title={`${p.k}: ${p.v}`} />)}
        </div>
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>{fmt(used)} / {fmt(size)} tokens ({Math.round(pct)}%)</span>
          <span style={{ color: over > 0 ? 'var(--bad)' : 'var(--good)' }}>{over > 0 ? `${fmt(over)} over the limit` : `${fmt(-over)} free`}</span>
        </div>
      </div>

      {over > 0 && (
        <div className="flex gap-3 rounded-2xl p-3.5 text-sm border" style={{ borderColor: 'color-mix(in oklab, var(--bad) 50%, transparent)', background: 'color-mix(in oklab, var(--bad) 10%, transparent)' }}>
          <AlertTriangle className="text-bad shrink-0" size={18} />
          <div>The request no longer fits. An app must now <b>truncate</b> old history, <b>summarise</b> it, or <b>retrieve less</b> — otherwise the API returns an error or silently drops the oldest messages.</div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        <SliderField label="System prompt" value={sys} min={0} max={8000} step={100} unit="tok" onChange={setSys} />
        <SliderField label="Tool definitions" value={tools} min={0} max={20000} step={250} unit="tok" onChange={setTools} />
        <SliderField label="Retrieved documents" value={docs} min={0} max={100000} step={500} unit="tok" onChange={setDocs} />
        <SliderField label="Conversation turns" value={turns} min={0} max={200} step={1} unit="turns" onChange={setTurns} />
        <SliderField label="Reserved for the answer" value={out} min={256} max={32000} step={256} unit="tok" onChange={setOut} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {parts.map((p) => <span key={p.k} className="text-xs text-muted inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: p.c }} />{p.k} <b className="text-ink">{fmt(p.v)}</b></span>)}
      </div>
      <p className="text-xs text-faint">The answer is part of the window too: input + output must fit together. (~450 tokens per chat turn assumed.)</p>
    </div>
  )
}
