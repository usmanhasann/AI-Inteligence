import { useLayoutEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { gsap, reduced } from '../lib/motion.ts'
import { Flip } from 'gsap/Flip'
import { SliderField } from '../components/Fields.tsx'

gsap.registerPlugin(Flip)

const OPTS = {
  flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
  justifyContent: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'],
  alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
  flexWrap: ['nowrap', 'wrap'],
} as const
type Key = keyof typeof OPTS

export default function Flexbox() {
  const [css, setCss] = useState<Record<Key, string>>({ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', flexWrap: 'nowrap' })
  const [gap, setGap] = useState(12)
  const [count, setCount] = useState(4)
  const box = useRef<HTMLDivElement>(null)
  const state = useRef<ReturnType<typeof Flip.getState> | null>(null)

  const set = (k: Key, v: string) => {
    if (box.current && !reduced()) state.current = Flip.getState(box.current.children)
    setCss((c) => ({ ...c, [k]: v }))
  }
  useLayoutEffect(() => {
    if (state.current) { Flip.from(state.current, { duration: 0.6, ease: 'power3.inOut', absolute: false }); state.current = null }
  }, [css, count])

  const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
  const code = `.container {\n  display: flex;\n${(Object.keys(css) as Key[]).map((k) => `  ${kebab(k)}: ${css[k]};`).join('\n')}\n  gap: ${gap}px;\n}`

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        {(Object.keys(OPTS) as Key[]).map((k) => (
          <div key={k}>
            <div className="eyebrow mb-1.5 font-mono !normal-case">{kebab(k)}</div>
            <div className="flex flex-wrap gap-1.5">
              {OPTS[k].map((o) => <button key={o} className="chip hover:border-brand2 font-mono" style={css[k] === o ? { color: 'var(--brand-2)', borderColor: 'var(--brand-2)', background: 'rgba(34,211,238,.1)' } : undefined} onClick={() => set(k, o)}>{o}</button>)}
            </div>
          </div>
        ))}
        <SliderField label="gap" value={gap} min={0} max={40} step={2} unit="px" onChange={setGap} />
      </div>

      <div className="flex items-center gap-3">
        <span className="eyebrow">Items</span>
        <button className="btn btn-sm btn-icon" onClick={() => { if (box.current) state.current = Flip.getState(box.current.children); setCount((c) => Math.max(1, c - 1)) }} aria-label="Remove item"><Minus size={14} /></button>
        <span className="font-display font-bold w-5 text-center">{count}</span>
        <button className="btn btn-sm btn-icon" onClick={() => { if (box.current) state.current = Flip.getState(box.current.children); setCount((c) => Math.min(9, c + 1)) }} aria-label="Add item"><Plus size={14} /></button>
      </div>

      <div ref={box} className="rounded-2xl border-2 border-dashed border-line2 p-3 h-60 overflow-hidden" style={{ display: 'flex', gap, ...css } as React.CSSProperties}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="rounded-xl grid place-items-center font-display font-bold text-lg text-white min-w-[56px]" style={{ background: `hsl(${250 + i * 26} 75% 58%)`, height: css.alignItems === 'stretch' ? undefined : 36 + (i % 3) * 22, padding: '0 14px', minHeight: 44 }}>
            {i + 1}
          </div>
        ))}
      </div>
      <pre className="rounded-2xl p-4 text-xs font-mono border border-line overflow-auto" style={{ background: 'rgba(0,0,0,.35)' }}>{code}</pre>
    </div>
  )
}
