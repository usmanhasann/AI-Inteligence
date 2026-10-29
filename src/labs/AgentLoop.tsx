import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Brain, Eye, Flag, Hammer, Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import { gsap, reduced, useGSAP } from '../lib/motion.ts'
import { SliderField } from '../components/Fields.tsx'

type Kind = 'thought' | 'action' | 'observation' | 'final' | 'stop'
interface Ev { kind: Kind; text: string; tok: number }

const META: Record<Kind, { label: string; icon: typeof Brain; color: string }> = {
  thought: { label: 'Think', icon: Brain, color: '#8b5cf6' },
  action: { label: 'Act', icon: Hammer, color: '#22d3ee' },
  observation: { label: 'Observe', icon: Eye, color: '#fbbf24' },
  final: { label: 'Done', icon: Flag, color: '#34d399' },
  stop: { label: 'Stopped', icon: Flag, color: '#fb7185' },
}

function script(fail: boolean): Ev[] {
  const e: Ev[] = [{ kind: 'thought', text: 'Goal: cheapest Fri–Sun flight to Lisbon, then put it on my calendar. First I need prices.', tok: 40 }]
  if (fail) {
    e.push({ kind: 'action', text: 'search_flights({ to: "LIS", dates: "Fri–Sun" })', tok: 30 })
    e.push({ kind: 'observation', text: 'Error 429: rate limited. Retry after 2s.', tok: 25 })
    e.push({ kind: 'thought', text: 'The tool failed temporarily. I should wait and retry rather than guess prices.', tok: 35 })
  }
  e.push({ kind: 'action', text: 'search_flights({ to: "LIS", dates: "Fri–Sun" })', tok: 30 })
  e.push({ kind: 'observation', text: '3 results: TAP $212 · Ryanair $187 · Delta $240', tok: 45 })
  e.push({ kind: 'thought', text: 'Ryanair at $187 is cheapest. Now I should create the calendar event.', tok: 32 })
  e.push({ kind: 'action', text: 'calendar.create({ title: "Flight to Lisbon", price: 187 })', tok: 35 })
  e.push({ kind: 'observation', text: 'Event created ✓ (id: evt_91)', tok: 20 })
  e.push({ kind: 'final', text: 'Done — the cheapest option is Ryanair at $187 and it’s on your calendar.', tok: 30 })
  return e
}

export default function AgentLoop() {
  const [fail, setFail] = useState(false)
  const [limit, setLimit] = useState(6)
  const [n, setN] = useState(0)
  const [auto, setAuto] = useState(false)
  const list = useRef<HTMLOListElement>(null)

  const full = useMemo(() => script(fail), [fail])
  const trace = useMemo(() => {
    let actions = 0
    const out: Ev[] = []
    for (const ev of full) {
      if (ev.kind === 'action') {
        if (actions >= limit) { out.push({ kind: 'stop', text: `Step limit (${limit}) reached before the goal was finished. A guardrail ended the run.`, tok: 10 }); return out }
        actions++
      }
      out.push(ev)
    }
    return out
  }, [full, limit])

  const shown = trace.slice(0, n)
  const done = n >= trace.length
  const tokens = 600 + shown.reduce((a, e) => a + e.tok, 0)
  const actions = shown.filter((e) => e.kind === 'action').length

  useEffect(() => { setN(0); setAuto(false) }, [fail, limit])
  useEffect(() => {
    if (!auto || done) { if (done) setAuto(false); return }
    const t = setTimeout(() => setN((x) => x + 1), 1100)
    return () => clearTimeout(t)
  }, [auto, n, done])

  useGSAP(
    () => {
      if (reduced() || !list.current || !n) return
      gsap.from(list.current.lastElementChild, { x: -26, opacity: 0, duration: 0.5, ease: 'power3.out' })
    },
    { dependencies: [n] },
  )

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-4 flex gap-3 items-start">
        <Bot className="text-brand2 shrink-0 mt-0.5" />
        <div><div className="eyebrow mb-0.5">Goal given to the agent</div><div className="font-medium">“Find the cheapest flight to Lisbon this weekend and add it to my calendar.”</div></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 items-end">
        <SliderField label="Max tool calls allowed (step limit)" value={limit} min={1} max={8} onChange={setLimit} />
        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium"><input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> Make the search tool fail once (rate-limit)</label>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-surface border border-line py-3"><div className="font-display text-2xl font-bold">{actions}<span className="text-faint text-base">/{limit}</span></div><div className="text-xs text-muted">tool calls</div></div>
        <div className="rounded-2xl bg-surface border border-line py-3"><div className="font-display text-2xl font-bold">{tokens}</div><div className="text-xs text-muted">context tokens</div></div>
        <div className="rounded-2xl bg-surface border border-line py-3"><div className="font-display text-2xl font-bold">{shown.filter((e) => e.kind === 'thought').length}</div><div className="text-xs text-muted">thoughts</div></div>
      </div>

      <ol ref={list} className="grid gap-2 min-h-[120px]">
        {shown.length === 0 && <li className="text-sm text-faint py-6 text-center">Press “Step” to run the loop one move at a time.</li>}
        {shown.map((e, i) => {
          const m = META[e.kind]
          return (
            <li key={i} className="flex gap-3 items-start rounded-xl border p-3" style={{ borderColor: `${m.color}55`, background: `${m.color}12` }}>
              <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${m.color}30`, color: m.color }}><m.icon size={16} /></span>
              <div className="min-w-0"><div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.label}</div><div className={e.kind === 'action' ? 'font-mono text-sm break-words' : 'text-sm'}>{e.text}</div></div>
            </li>
          )
        })}
      </ol>

      <div className="flex gap-3 flex-wrap">
        <button className="btn btn-primary" onClick={() => setN((x) => Math.min(trace.length, x + 1))} disabled={done}><StepForward size={16} /> Step</button>
        <button className="btn" onClick={() => setAuto((a) => !a)} disabled={done}>{auto ? <><Pause size={16} /> Pause</> : <><Play size={16} className="fill-current" /> Auto-run</>}</button>
        <button className="btn btn-ghost" onClick={() => { setN(0); setAuto(false) }}><RotateCcw size={16} /> Reset</button>
      </div>
      <p className="text-xs text-faint">Every thought, call and result is appended to the context — that’s why long agent runs get slower, pricier and eventually need summarising.</p>
    </div>
  )
}
