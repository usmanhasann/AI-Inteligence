import { useMemo, useState } from 'react'
import { Dice5 } from 'lucide-react'
import { SliderField } from '../components/Fields.tsx'

const CANDIDATES = [
  { t: ' Paris', l: 6.2 }, { t: ' the', l: 3.6 }, { t: ' a', l: 3.1 }, { t: ' located', l: 2.8 },
  { t: ' known', l: 2.3 }, { t: ' Lyon', l: 1.6 }, { t: ' France', l: 1.2 }, { t: ' Berlin', l: -0.2 },
]

function distribution(temp: number, topP: number, topK: number) {
  const scaled = CANDIDATES.map((c) => c.l / temp)
  const mx = Math.max(...scaled)
  const ex = scaled.map((s) => Math.exp(s - mx))
  const z = ex.reduce((a, b) => a + b, 0)
  const probs = ex.map((e) => e / z)
  const order = probs.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p)
  let cum = 0
  const keep = new Set<number>()
  order.forEach((o, rank) => {
    if (rank < topK && (cum < topP || rank === 0)) keep.add(o.i)
    cum += o.p
  })
  const kz = [...keep].reduce((a, i) => a + probs[i], 0)
  return probs.map((p, i) => ({ ...CANDIDATES[i], p, kept: keep.has(i), final: keep.has(i) ? p / kz : 0 }))
}

export default function Sampling() {
  const [temp, setTemp] = useState(0.8)
  const [topP, setTopP] = useState(1)
  const [topK, setTopK] = useState(8)
  const [picked, setPicked] = useState<number[]>([])
  const dist = useMemo(() => distribution(temp, topP, topK), [temp, topP, topK])

  const draw = () => {
    let r = Math.random()
    for (let i = 0; i < dist.length; i++) { r -= dist[i].final; if (r <= 0) return i }
    return 0
  }
  const sample = (n: number) => setPicked((p) => [...p, ...Array.from({ length: n }, draw)].slice(-100))
  const counts = CANDIDATES.map((_, i) => picked.filter((x) => x === i).length)
  const mood = temp < 0.35 ? 'Near-deterministic: it nearly always picks the top token.' : temp < 1.1 ? 'Balanced: usually sensible, with some variety.' : 'Creative / risky: unlikely tokens get a real chance.'

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line p-4 font-mono text-sm" style={{ background: 'rgba(0,0,0,.22)' }}>
        The capital of France is<span className="text-brand2 font-bold">{picked.length ? CANDIDATES[picked[picked.length - 1]].t : ' …'}</span>
        <span className="animate-pulse text-brand2">▍</span>
      </div>

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
        <SliderField label="Temperature" value={temp} min={0.05} max={2} step={0.05} onChange={setTemp} format={(v) => v.toFixed(2)} />
        <SliderField label="Top-p" value={topP} min={0.1} max={1} step={0.05} onChange={setTopP} format={(v) => v.toFixed(2)} />
        <SliderField label="Top-k" value={topK} min={1} max={8} step={1} onChange={setTopK} />
      </div>
      <p className="text-sm text-muted -mt-1">{mood}</p>

      <ul className="grid gap-2">
        {dist.map((d, i) => (
          <li key={d.t} className="grid grid-cols-[88px_1fr_52px] items-center gap-3 text-sm" style={{ opacity: d.kept ? 1 : 0.35 }}>
            <span className="font-mono truncate">{d.t.replace(' ', '␣')}</span>
            <div className="h-5 rounded-md bg-surface2 overflow-hidden relative">
              <div className="h-full rounded-md transition-all duration-500" style={{ width: `${d.final * 100}%`, background: `linear-gradient(90deg, var(--brand), var(--brand-2))` }} />
              {picked.length > 5 && <div className="absolute inset-y-0 border-r-2 border-warn" style={{ left: `${(counts[i] / picked.length) * 100}%` }} title={`sampled ${counts[i]}×`} />}
            </div>
            <span className="tabular-nums text-right text-muted">{(d.final * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 items-center">
        <button className="btn btn-primary" onClick={() => sample(1)}><Dice5 size={16} /> Sample 1 token</button>
        <button className="btn" onClick={() => sample(50)}>Sample 50×</button>
        <button className="btn btn-ghost" onClick={() => setPicked([])}>Reset</button>
        {picked.length > 5 && <span className="text-xs text-muted">Yellow marks = how often each token was actually drawn (last {picked.length}).</span>}
      </div>
      <p className="text-xs text-faint">Dimmed tokens were cut by top-p / top-k before sampling. Logits are illustrative, but the softmax maths is the real thing.</p>
    </div>
  )
}
