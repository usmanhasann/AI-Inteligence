import { useState } from 'react'
import { SliderField } from '../components/Fields.tsx'

// Illustrative per-million-token prices to teach the maths — always check current provider pricing.
const TIERS = [
  { k: 'Small / fast', in: 0.3, out: 1.5, c: '#34d399' },
  { k: 'Mid-size', in: 3, out: 15, c: '#8b5cf6' },
  { k: 'Frontier', in: 15, out: 75, c: '#f472b6' },
]
const usd = (n: number) => (n < 1 ? `$${n.toFixed(3)}` : n < 100 ? `$${n.toFixed(2)}` : `$${Math.round(n).toLocaleString()}`)

export default function CostCalculator() {
  const [reqs, setReqs] = useState(2000)
  const [inTok, setIn] = useState(3000)
  const [outTok, setOut] = useState(500)
  const [cache, setCache] = useState(0)
  const [batch, setBatch] = useState(false)
  const [tier, setTier] = useState(1)

  const monthly = (t: (typeof TIERS)[number]) => {
    const effIn = inTok * (1 - cache / 100) + inTok * (cache / 100) * 0.1
    const per = (effIn * t.in + outTok * t.out) / 1e6 * (batch ? 0.5 : 1)
    return { per, month: per * reqs * 30 }
  }
  const cur = monthly(TIERS[tier])
  const max = Math.max(...TIERS.map((t) => monthly(t).month))

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        <SliderField label="Requests per day" value={reqs} min={100} max={100000} step={100} onChange={setReqs} format={(v) => v.toLocaleString()} />
        <SliderField label="Input tokens / request" value={inTok} min={100} max={50000} step={100} onChange={setIn} format={(v) => v.toLocaleString()} />
        <SliderField label="Output tokens / request" value={outTok} min={50} max={4000} step={50} onChange={setOut} format={(v) => v.toLocaleString()} />
        <SliderField label="Prompt-cache hit rate" value={cache} min={0} max={95} step={5} unit="%" onChange={setCache} />
      </div>
      <label className="flex items-center gap-3 text-sm font-medium cursor-pointer"><input type="checkbox" checked={batch} onChange={(e) => setBatch(e.target.checked)} /> Run as batch / async job (≈50% cheaper, results later)</label>

      <div className="grid gap-3">
        {TIERS.map((t, i) => {
          const m = monthly(t)
          return (
            <button key={t.k} onClick={() => setTier(i)} className="text-left rounded-2xl border p-4 transition-colors" style={{ borderColor: tier === i ? t.c : 'var(--border)', background: tier === i ? `${t.c}14` : 'var(--surface)' }}>
              <div className="flex justify-between items-baseline gap-3 mb-2">
                <span className="font-semibold">{t.k} <span className="text-xs text-muted font-normal">${t.in} in · ${t.out} out per 1M</span></span>
                <span className="font-display text-xl font-bold tabular-nums">{usd(m.month)}<span className="text-xs text-muted font-sans font-normal"> /mo</span></span>
              </div>
              <div className="h-2 rounded-full bg-surface2 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(m.month / max) * 100}%`, background: t.c }} /></div>
              <div className="text-xs text-muted mt-1.5">{usd(m.per)} per request</div>
            </button>
          )
        })}
      </div>
      <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
        <b>{TIERS[tier].k}:</b> {reqs.toLocaleString()} requests/day × 30 days ≈ <b>{usd(cur.month)}</b> per month.
        {cache === 0 && inTok > 5000 && <span className="text-muted"> Large repeated prompts? Raise the cache hit rate and watch input cost fall.</span>}
      </div>
      <p className="text-xs text-faint">Prices are illustrative round numbers (not any provider’s current rates); cached input is modelled at 10% of normal price. Output tokens usually cost several times more than input.</p>
    </div>
  )
}
