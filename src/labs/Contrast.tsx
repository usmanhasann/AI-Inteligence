import { useMemo, useState } from 'react'
import { Check, Wand2, X } from 'lucide-react'

const hex = (s: string) => {
  const m = s.trim().replace('#', '')
  const f = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  return /^[0-9a-f]{6}$/i.test(f) ? f.toLowerCase() : null
}
const lum = (h: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const ratio = (a: string, b: string) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
const darken = (h: string, bg: string, target: number) => {
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  const dir = lum(bg) > 0.5 ? -1 : 1
  for (let i = 0; i < 80 && ratio(((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1), bg) < target; i++) {
    r = Math.max(0, Math.min(255, r + dir * 4)); g = Math.max(0, Math.min(255, g + dir * 4)); b = Math.max(0, Math.min(255, b + dir * 4))
  }
  return ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

const PRESETS = [
  { n: 'Light gray on white', fg: '9ca3af', bg: 'ffffff' }, { n: 'Dark gray on white', fg: '6b7280', bg: 'ffffff' },
  { n: 'White on purple', fg: 'ffffff', bg: '7c3aed' }, { n: 'Yellow on white', fg: 'facc15', bg: 'ffffff' }, { n: 'Mint on black', fg: '34d399', bg: '000000' },
]

function Pass({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: ok ? 'color-mix(in oklab, var(--good) 50%, transparent)' : 'color-mix(in oklab, var(--bad) 45%, transparent)', background: ok ? 'color-mix(in oklab, var(--good) 9%, transparent)' : 'color-mix(in oklab, var(--bad) 8%, transparent)' }}>
      {ok ? <Check size={16} className="text-good" strokeWidth={3} /> : <X size={16} className="text-bad" strokeWidth={3} />}{label}
    </div>
  )
}

export default function Contrast() {
  const [fg, setFg] = useState('9ca3af')
  const [bg, setBg] = useState('ffffff')
  const f = hex(fg), b = hex(bg)
  const r = useMemo(() => (f && b ? ratio(f, b) : 0), [f, b])

  const Field = ({ label, v, set, valid }: { label: string; v: string; set: (s: string) => void; valid: string | null }) => (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="flex gap-2">
        <input type="color" aria-label={`${label} colour`} value={`#${valid ?? '000000'}`} onChange={(e) => set(e.target.value.slice(1))} className="w-12 h-11 rounded-xl border border-line bg-transparent p-1 cursor-pointer" />
        <input className="input font-mono" value={`#${v.replace('#', '')}`} onChange={(e) => set(e.target.value.replace('#', ''))} aria-label={`${label} hex`} style={valid ? undefined : { borderColor: 'var(--bad)' }} />
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => <button key={p.n} className="chip hover:border-brand2" onClick={() => { setFg(p.fg); setBg(p.bg) }}>{p.n}</button>)}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Text colour" v={fg} set={setFg} valid={f} />
        <Field label="Background" v={bg} set={setBg} valid={b} />
      </div>
      <div className="rounded-2xl p-6 border border-line" style={{ background: `#${b ?? 'fff'}`, color: `#${f ?? '000'}` }}>
        <div className="text-3xl font-bold leading-tight mb-2">Large heading (24px bold)</div>
        <p className="text-base">Body text at 16px. Can your users read this in sunlight, on a cheap screen, or with low vision?</p>
        <button className="mt-3 px-4 py-2 rounded-lg font-semibold border-2" style={{ borderColor: `#${f ?? '000'}` }}>Button</button>
      </div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div><div className="eyebrow">Contrast ratio</div><div className="font-display text-5xl font-bold tabular-nums" style={{ color: r >= 4.5 ? 'var(--good)' : r >= 3 ? 'var(--warn)' : 'var(--bad)' }}>{r.toFixed(2)}<span className="text-2xl text-muted">:1</span></div></div>
        {f && b && r < 4.5 && <button className="btn" onClick={() => setFg(darken(f, b, 4.5))}><Wand2 size={16} /> Fix text colour to AA</button>}
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        <Pass ok={r >= 4.5} label="AA · normal text (4.5:1)" />
        <Pass ok={r >= 3} label="AA · large text & UI (3:1)" />
        <Pass ok={r >= 7} label="AAA · normal text (7:1)" />
        <Pass ok={r >= 4.5} label="Safe for body copy" />
      </div>
    </div>
  )
}
