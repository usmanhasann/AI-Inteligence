import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../lib/course.ts'
import { TRACKS, accent } from '../lib/tracks.ts'
import { useReveal } from '../lib/motion.ts'
import type { Track } from '../lib/types.ts'

interface Entry { term: string; def: string; conceptId: string; main: boolean; track: Track }

export default function Glossary() {
  const course = useCourse()
  const [q, setQ] = useState('')
  const [track, setTrack] = useState<Track | 'all'>('all')
  const ref = useRef<HTMLDivElement>(null)

  const entries = useMemo(() => {
    const out: Entry[] = []
    for (const id of course.order) {
      const c = course.concepts[id]
      const t = course.weekById[course.weekOf[id]]?.track ?? 'custom'
      out.push({ term: c.title, def: c.tldr, conceptId: id, main: true, track: t })
      c.glossary.forEach((g) => out.push({ term: g.term, def: g.def, conceptId: id, main: false, track: t }))
    }
    return out.sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }))
  }, [course])

  const shown = entries.filter((e) => (track === 'all' || e.track === track) && (!q.trim() || (e.term + ' ' + e.def).toLowerCase().includes(q.trim().toLowerCase())))
  const letters = useMemo(() => {
    const m = new Map<string, Entry[]>()
    for (const e of shown) {
      const l = /[a-z]/i.test(e.term[0]) ? e.term[0].toUpperCase() : '#'
      m.set(l, [...(m.get(l) ?? []), e])
    }
    return [...m.entries()]
  }, [shown])
  const usedTracks = [...new Set(entries.map((e) => e.track))]
  useReveal(ref, [])

  return (
    <div ref={ref}>
      <div className="mb-7" data-reveal>
        <div className="eyebrow mb-1">Every term in one place</div>
        <h1 className="text-4xl sm:text-5xl font-bold"><span className="text-gradient">Glossary</span></h1>
        <p className="text-muted mt-2">{entries.length} terms and counting — import more material and it grows.</p>
      </div>
      <div className="sticky top-14 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 glass border-b border-line mb-6" data-reveal>
        <div className="relative max-w-xl mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input !pl-10" placeholder="Filter terms…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button className={clsx('chip shrink-0', track === 'all' && 'chip-accent')} onClick={() => setTrack('all')}>All</button>
          {usedTracks.map((t) => (
            <button key={t} className="chip shrink-0" onClick={() => setTrack(t)} style={track === t ? { color: accent(TRACKS[t].hue), borderColor: accent(TRACKS[t].hue) } : undefined}>{TRACKS[t].label}</button>
          ))}
        </div>
        <div className="hidden sm:flex flex-wrap gap-1 mt-3">
          {letters.map(([l]) => <a key={l} href={`#g-${l}`} onClick={(e) => { e.preventDefault(); document.getElementById(`g-${l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="w-7 h-7 rounded-lg grid place-items-center text-xs font-bold text-muted hover:text-ink hover:bg-surface2">{l}</a>)}
        </div>
      </div>
      <div className="space-y-8">
        {letters.map(([l, list]) => (
          <section key={l} id={`g-${l}`} className="scroll-mt-52">
            <div className="font-display text-3xl font-bold text-gradient mb-3" data-scroll>{l}</div>
            <div className="grid md:grid-cols-2 gap-3">
              {list.map((e, i) => (
                <Link key={e.term + i} to={`/concept/${e.conceptId}`} className="card card-hover p-4 block" style={{ '--accent': accent(TRACKS[e.track].hue) } as React.CSSProperties} data-scroll>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold">{e.term}</span>
                    {e.main && <span className="chip chip-accent">concept</span>}
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-3">{e.def}</p>
                  {!e.main && <div className="text-[11px] text-faint mt-2">in {course.concepts[e.conceptId].title}</div>}
                </Link>
              ))}
            </div>
          </section>
        ))}
        {!letters.length && <div className="text-muted">No terms match.</div>}
      </div>
    </div>
  )
}
