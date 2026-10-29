import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Download, FolderPlus, Plus, Search, Trash2 } from 'lucide-react'
import { useCourse } from '../lib/course.ts'
import { useStore, toast } from '../lib/store.ts'
import { TRACKS, accent } from '../lib/tracks.ts'
import { useReveal } from '../lib/motion.ts'
import { saveTextFile } from '../lib/platform.ts'
import { Empty } from '../components/ui.tsx'
import { Seg } from '../components/Fields.tsx'
import { CollectionPicker } from '../components/CollectionPicker.tsx'
import { SaveButton } from '../components/cards.tsx'
import type { Concept, Collection } from '../lib/types.ts'

function SavedCard({ concept, onCollect, collections }: { concept: Concept; onCollect: () => void; collections: Collection[] }) {
  const item = useStore((s) => s.saved[concept.id])
  const updateSaved = useStore((s) => s.updateSaved)
  const course = useCourse()
  const week = course.weekById[course.weekOf[concept.id]]
  const hue = week ? TRACKS[week.track].hue : 265
  const mine = collections.filter((c) => item?.collections.includes(c.id))
  return (
    <article className="card p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden" data-scroll>
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30" style={{ background: accent(hue) }} />
      <div className="relative flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl grid place-items-center text-2xl border shrink-0" style={{ background: `${accent(hue)}1a`, borderColor: `${accent(hue)}40` }}>{concept.emoji}</div>
        <Link to={`/concept/${concept.id}`} className="flex-1 min-w-0">
          <h3 className="font-display font-semibold leading-snug">{concept.title}</h3>
          <p className="text-sm text-muted line-clamp-2 mt-0.5">{concept.tldr}</p>
        </Link>
        <SaveButton id={concept.id} size="sm" />
      </div>
      <textarea
        className="input !min-h-[56px] !text-sm"
        placeholder="Add a personal note…"
        value={item?.note ?? ''}
        onChange={(e) => updateSaved(concept.id, { note: e.target.value })}
        rows={2}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {week && <span className="chip" style={{ color: accent(hue) }}>W{week.index}</span>}
        {mine.map((c) => <span key={c.id} className="chip">{c.emoji} {c.name}</span>)}
        <button className="chip hover:border-brand2 ml-auto" onClick={onCollect}><FolderPlus size={11} /> Collect</button>
      </div>
    </article>
  )
}

export default function Gallery() {
  const course = useCourse()
  const { saved, collections, addCollection, removeCollection } = useStore()
  const [view, setView] = useState<'week' | 'collection' | 'all'>('week')
  const [q, setQ] = useState('')
  const [pick, setPick] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const ids = useMemo(() => {
    const s = q.trim().toLowerCase()
    return Object.keys(saved)
      .filter((id) => course.concepts[id])
      .filter((id) => !s || course.concepts[id].title.toLowerCase().includes(s) || (saved[id].note ?? '').toLowerCase().includes(s))
      .sort((a, b) => course.order.indexOf(a) - course.order.indexOf(b))
  }, [saved, q, course])
  useReveal(ref, [view, ids.length])

  const byWeek = course.weeks.map((w) => ({ w, ids: ids.filter((id) => course.weekOf[id] === w.id) })).filter((g) => g.ids.length)

  const exportMd = () => {
    const out = ['# My saved concepts', '']
    for (const g of byWeek) {
      out.push(`## Week ${g.w.index}: ${g.w.title}`, '')
      for (const id of g.ids) {
        const c = course.concepts[id]
        out.push(`### ${c.emoji} ${c.title}`, c.tldr, '')
        if (saved[id].note) out.push(`> **My note:** ${saved[id].note}`, '')
        c.takeaways.forEach((t) => out.push(`- ${t}`))
        out.push('')
      }
    }
    void saveTextFile('my-saved-concepts.md', out.join('\n'), 'text/markdown').then(() => toast('Exported your gallery', 'good'))
  }

  const grid = (list: string[]) => (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {list.map((id) => <SavedCard key={id} concept={course.concepts[id]} collections={collections} onCollect={() => setPick(id)} />)}
    </div>
  )

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7" data-reveal>
        <div>
          <div className="eyebrow mb-1">Your gallery</div>
          <h1 className="text-4xl sm:text-5xl font-bold">Saved <span className="text-gradient">concepts</span></h1>
          <p className="text-muted mt-2">{Object.keys(saved).length} saved · auto-organised by week, plus your own collections.</p>
        </div>
        <button className="btn" onClick={exportMd} disabled={!ids.length}><Download size={16} /> Export as Markdown</button>
      </div>

      {Object.keys(saved).length === 0 ? (
        <Empty emoji="⭐" title="Your gallery is empty">
          Tap the <Bookmark size={14} className="inline -mt-0.5" /> on any concept to keep it here. Saved concepts are grouped by week automatically.
          <div className="mt-5"><Link to="/roadmap" className="btn btn-primary">Browse the roadmap</Link></div>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6" data-reveal>
            <Seg value={view} onChange={setView} options={[{ v: 'week', label: 'By week' }, { v: 'collection', label: 'Collections' }, { v: 'all', label: 'All' }]} />
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input className="input !pl-10" placeholder="Search saved & notes…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          {view === 'week' && (
            <div className="space-y-10">
              {byWeek.map(({ w, ids: list }) => (
                <section key={w.id}>
                  <div className="flex items-center gap-3 mb-4" data-scroll>
                    <span className="w-10 h-10 rounded-xl grid place-items-center text-xl border" style={{ borderColor: `${accent(TRACKS[w.track].hue)}55`, background: `${accent(TRACKS[w.track].hue)}18` }}>{w.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <Link to={`/week/${w.id}`} className="font-display text-xl font-semibold hover:text-brand2">Week {w.index} · {w.title}</Link>
                      <div className="text-xs text-muted">{list.length} saved of {w.concepts.length}</div>
                    </div>
                  </div>
                  {grid(list)}
                </section>
              ))}
              {!byWeek.length && <div className="text-muted">No matches.</div>}
            </div>
          )}

          {view === 'collection' && (
            <div className="space-y-10">
              <div className="card p-4 flex gap-2 max-w-xl" data-reveal>
                <input className="input" placeholder="New collection name (e.g. “Interview prep”)" value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { addCollection({ name: newName.trim(), emoji: '📌', hue: Math.floor(Math.random() * 360) }); setNewName('') } }} />
                <button className="btn btn-primary" onClick={() => { if (newName.trim()) { addCollection({ name: newName.trim(), emoji: '📌', hue: Math.floor(Math.random() * 360) }); setNewName('') } }}><Plus size={16} /> Create</button>
              </div>
              {collections.map((c) => {
                const list = ids.filter((id) => saved[id].collections.includes(c.id))
                return (
                  <section key={c.id}>
                    <div className="flex items-center gap-3 mb-4" data-scroll>
                      <span className="text-2xl">{c.emoji}</span>
                      <h2 className="font-display text-xl font-semibold flex-1">{c.name} <span className="text-sm text-muted font-normal">· {list.length}</span></h2>
                      <button className="btn btn-ghost btn-icon btn-sm text-faint" aria-label="Delete collection" onClick={() => confirm(`Delete “${c.name}”? Concepts stay saved.`) && removeCollection(c.id)}><Trash2 size={15} /></button>
                    </div>
                    {list.length ? grid(list) : <div className="text-sm text-faint">Empty — use “Collect” on a saved card to add it here.</div>}
                  </section>
                )
              })}
              {(() => {
                const loose = ids.filter((id) => saved[id].collections.length === 0)
                return loose.length ? (
                  <section>
                    <h2 className="font-display text-xl font-semibold mb-4" data-scroll>Not in a collection <span className="text-sm text-muted font-normal">· {loose.length}</span></h2>
                    {grid(loose)}
                  </section>
                ) : null
              })()}
            </div>
          )}

          {view === 'all' && (ids.length ? grid(ids) : <div className="text-muted">No matches.</div>)}
        </>
      )}
      <CollectionPicker id={pick ?? ''} open={!!pick} onClose={() => setPick(null)} />
    </div>
  )
}
