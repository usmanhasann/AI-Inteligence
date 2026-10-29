import { useEffect, useRef, useState } from 'react'
import { Database, Globe, HardDrive, Laptop, Send, Server, Zap } from 'lucide-react'
import { gsap, reduced } from '../lib/motion.ts'

interface Node { id: string; label: string; icon: typeof Globe; ms: number; note: string }

export default function RequestFlow() {
  const [cdnHit, setCdnHit] = useState(false)
  const [cacheHit, setCacheHit] = useState(false)
  const [indexed, setIndexed] = useState(true)
  const [running, setRunning] = useState(false)
  const [total, setTotal] = useState(0)
  const [active, setActive] = useState(-1)
  const [log, setLog] = useState<string[]>([])
  const row = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      if (dot.current) gsap.killTweensOf(dot.current)
    }
  }, [])

  const nodes: Node[] = [
    { id: 'browser', label: 'Browser', icon: Laptop, ms: 0, note: 'User clicks “Load dashboard”' },
    { id: 'dns', label: 'DNS + TLS', icon: Globe, ms: 35, note: 'Resolve the domain, set up HTTPS' },
    { id: 'cdn', label: 'CDN / edge', icon: Zap, ms: 12, note: cdnHit ? 'Cache HIT — served from the edge, journey ends here' : 'Cache MISS — forward to origin' },
    { id: 'api', label: 'API server', icon: Server, ms: 28, note: 'Auth check, run business logic' },
    { id: 'cache', label: 'Redis cache', icon: HardDrive, ms: 3, note: cacheHit ? 'Cache HIT — data returned instantly' : 'Cache MISS — ask the database' },
    { id: 'db', label: 'Database', icon: Database, ms: indexed ? 9 : 140, note: indexed ? 'Index lookup — fast' : 'Full table scan — slow!' },
  ]
  const path = nodes.filter((n, i) => !(cdnHit && i > 2) && !(cacheHit && n.id === 'db'))

  const run = async () => {
    if (running) return
    setRunning(true); setTotal(0); setLog([]); setActive(0)
    const wrap = row.current?.getBoundingClientRect()
    if (!wrap) return setRunning(false)
    const pos = (id: string) => { const r = nodeRefs.current[nodes.findIndex((n) => n.id === id)]?.getBoundingClientRect(); return r ? r.left + r.width / 2 - wrap.left - 8 : 0 }
    const steps = [...path, ...path.slice(0, -1).reverse().map((n) => ({ ...n, ms: Math.round(n.ms * 0.4), note: 'Response travels back', back: true }))]
    let t = 0
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i] as Node & { back?: boolean }
      const idx = nodes.findIndex((n) => n.id === s.id)
      await new Promise<void>((res) => {
        if (!alive.current || !dot.current) return res()
        if (reduced()) { gsap.set(dot.current, { x: pos(s.id) }); setTimeout(res, 150); return }
        gsap.to(dot.current, { x: pos(s.id), duration: 0.5, ease: 'power2.inOut', onComplete: res })
      })
      if (!alive.current) return
      t += s.ms
      setActive(idx); setTotal(t)
      setLog((l) => [...l, `${s.back ? '↩ ' : ''}${s.label}: +${s.ms}ms — ${s.note}`])
      await new Promise((r) => setTimeout(r, reduced() ? 60 : 280))
      if (!alive.current) return
    }
    setRunning(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={cdnHit} onChange={(e) => setCdnHit(e.target.checked)} /> CDN cache hit</label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={cacheHit} onChange={(e) => setCacheHit(e.target.checked)} disabled={cdnHit} /> Redis cache hit</label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={indexed} onChange={(e) => setIndexed(e.target.checked)} disabled={cdnHit || cacheHit} /> DB column indexed</label>
      </div>

      <div ref={row} className="relative rounded-2xl border border-line p-4 pt-9 overflow-x-auto" style={{ background: 'rgba(0,0,0,.22)' }}>
        <div className="absolute top-3 left-4 right-4 h-0.5 rounded bg-surface2" />
        <div ref={dot} className="absolute top-[7px] left-4 w-4 h-4 rounded-full bg-brand2 shadow-[0_0_18px_var(--brand-2)] z-10" />
        <div className="flex justify-between gap-2 min-w-[540px]">
          {nodes.map((n, i) => {
            const skipped = !path.includes(n)
            return (
              <div key={n.id} ref={(el) => { nodeRefs.current[i] = el }} className="flex flex-col items-center gap-1.5 w-[84px] text-center transition-opacity" style={{ opacity: skipped ? 0.25 : 1 }}>
                <span className="w-12 h-12 rounded-2xl grid place-items-center border-2 transition-all" style={{ borderColor: active === i ? 'var(--brand-2)' : 'var(--border-strong)', background: active === i ? 'rgba(34,211,238,.15)' : 'var(--surface)', transform: active === i ? 'scale(1.12)' : undefined }}><n.icon size={20} /></span>
                <span className="text-xs font-semibold">{n.label}</span>
                <span className="text-[10px] text-faint">{n.id === 'browser' ? 'start' : `${n.ms}ms`}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <button className="btn btn-primary" onClick={run} disabled={running}><Send size={16} /> Send request</button>
        <div className="font-display text-3xl font-bold tabular-nums" style={{ color: total > 150 ? 'var(--bad)' : total > 80 ? 'var(--warn)' : 'var(--good)' }}>{total}<span className="text-base text-muted font-sans"> ms total</span></div>
      </div>
      <ul className="grid gap-1 text-sm font-mono min-h-[60px]">
        {log.map((l, i) => <li key={i} className="text-muted">{l}</li>)}
        {!log.length && <li className="text-faint">Toggle the options and send a request — then compare totals.</li>}
      </ul>
      <p className="text-xs text-faint">Timings are illustrative. The lesson: every layer you can skip (CDN, cache, index) removes whole round-trips.</p>
    </div>
  )
}
