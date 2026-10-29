import { useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Check, ClipboardCopy, FileJson, FileText, FileType, Loader2, Sparkles, Trash2, UploadCloud, Wand2 } from 'lucide-react'
import clsx from 'clsx'
import { LIBRARY_MONTH_ID, useCourse, type Course } from '../lib/course.ts'
import { useStore, toast } from '../lib/store.ts'
import { slugify } from '../lib/mdPack.ts'
import { ACCEPT, parseFile, parseTextPack } from '../lib/importers/index.ts'
import { parseJsonPack } from '../lib/importers/json.ts'
import { AI_PROMPT, JSON_TEMPLATE, MD_TEMPLATE } from '../lib/importers/templates.ts'
import { copyText, saveTextFile } from '../lib/platform.ts'
import { confetti, gsap, reduced, useReveal } from '../lib/motion.ts'
import type { ImportKind, ImportedPack, NewWeek, ParsedConcept, ParsedPack } from '../lib/types.ts'
import { Seg } from '../components/Fields.tsx'

interface DraftConcept { c: ParsedConcept; include: boolean }
interface DraftGroup { key: string; target: string; newTitle: string; concepts: DraftConcept[] }
interface Draft { id: string; fileName: string; kind: ImportKind; title: string; warnings: string[]; groups: DraftGroup[] }

function resolveHint(hint: string, course: Course): string | null {
  const h = hint.trim()
  if (course.weekById[h]) return h
  const n = Number(h)
  if (Number.isInteger(n) && course.weeks[n - 1]) return course.weeks[n - 1].id
  const byTitle = course.weeks.find((w) => w.title.toLowerCase() === h.toLowerCase())
  return byTitle ? byTitle.id : null
}

function makeDraft(pack: ParsedPack, fileName: string, kind: ImportKind, course: Course): Draft {
  const groups: DraftGroup[] = []
  const add = (key: string, target: string, newTitle: string, c: ParsedConcept) => {
    let g = groups.find((x) => x.key === key)
    if (!g) groups.push((g = { key, target, newTitle, concepts: [] }))
    g.concepts.push({ c, include: true })
  }
  pack.groups.forEach((g, gi) => {
    // A file made only of existing concepts is a pure update → stay in their week. Anything new gets its own week
    // (existing concepts in a mixed group keep their original week when committed).
    const existing = g.concepts.filter((c) => course.concepts[c.id])
    const defaultTarget = existing.length && existing.length === g.concepts.length ? course.weekOf[existing[0].id] : 'new'
    for (const c of g.concepts) {
      const hint = c.weekHint ? resolveHint(c.weekHint, course) : null
      if (hint) add(`h:${hint}`, hint, '', c)
      else if (c.weekHint && !/^\d+$/.test(c.weekHint)) add(`n:${c.weekHint}`, 'new', c.weekHint, c)
      else add(`g:${gi}`, defaultTarget, g.title, c)
    }
  })
  return { id: Math.random().toString(36).slice(2), fileName, kind, title: pack.title, warnings: pack.warnings, groups }
}

function buildPack(d: Draft, course: Course): ImportedPack | null {
  const newWeeks = new Map<string, NewWeek>()
  const concepts: ImportedPack['concepts'] = []
  for (const g of d.groups) {
    let weekId = g.target
    if (g.target === 'new') {
      const title = g.newTitle.trim() || d.title
      weekId = 'x-' + (slugify(title) || 'imported')
      if (!course.weekById[weekId] && !newWeeks.has(weekId))
        newWeeks.set(weekId, { id: weekId, monthId: LIBRARY_MONTH_ID, title, subtitle: `Imported from ${d.fileName}`, emoji: '📥', track: 'custom', outcome: `Concepts you imported from ${d.fileName}.`, concepts: [] })
    }
    for (const { c, include } of g.concepts) {
      if (!include) continue
      const { weekHint: _h, ...rest } = c
      concepts.push({ ...rest, weekId: course.concepts[c.id] ? course.weekOf[c.id] ?? weekId : weekId })
    }
  }
  if (!concepts.length) return null
  return { id: 'pk-' + (slugify(d.title) || slugify(d.fileName) || 'pack'), title: d.title, fileName: d.fileName, kind: d.kind, importedAt: Date.now(), newWeeks: [...newWeeks.values()], concepts }
}

const KIND_ICON = { json: FileJson, md: FileText, txt: FileText, pdf: FileType, paste: FileText } as const

export default function ImportPage() {
  const course = useCourse()
  const { packs, addPack, removePack } = useStore()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [over, setOver] = useState(false)
  const [paste, setPaste] = useState('')
  const [tab, setTab] = useState<'json' | 'md' | 'ai'>('ai')
  const fileInput = useRef<HTMLInputElement>(null)
  const zone = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref, [])

  const handleFiles = async (files: FileList | File[]) => {
    const list = [...files]
    if (!list.length) return
    setErrors([])
    for (const f of list) {
      setBusy(f.name)
      try {
        const { kind, pack } = await parseFile(f)
        setDrafts((d) => [...d, makeDraft(pack, f.name, kind, course)])
      } catch (e) {
        setErrors((x) => [...x, (e as Error).message])
      }
    }
    setBusy(null)
  }
  const handlePaste = () => {
    setErrors([])
    try {
      const t = paste.trim()
      const pack = t.startsWith('{') || t.startsWith('[') ? parseJsonPack(t, 'Pasted notes') : parseTextPack(t, 'Pasted notes')
      setDrafts((d) => [...d, makeDraft(pack, 'pasted-notes', 'paste', course)])
      setPaste('')
    } catch (e) {
      setErrors([(e as Error).message])
    }
  }
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void handleFiles(e.dataTransfer.files)
  }
  const commit = (d: Draft) => {
    const p = buildPack(d, course)
    if (!p) return toast('Select at least one concept', 'bad')
    const updated = p.concepts.filter((c) => course.concepts[c.id]).length
    addPack(p)
    setDrafts((x) => x.filter((y) => y.id !== d.id))
    toast(`Added ${p.concepts.length - updated} new${updated ? `, updated ${updated}` : ''} ✨`, 'good')
    confetti(window.innerWidth / 2, 220, 60)
  }
  const patch = (did: string, gi: number, fn: (g: DraftGroup) => DraftGroup) =>
    setDrafts((ds) => ds.map((d) => (d.id === did ? { ...d, groups: d.groups.map((g, i) => (i === gi ? fn(g) : g)) } : d)))

  const tpl = tab === 'json' ? JSON.stringify(JSON_TEMPLATE, null, 2) : tab === 'md' ? MD_TEMPLATE : AI_PROMPT

  return (
    <div ref={ref} className="max-w-4xl mx-auto">
      <div className="mb-8" data-reveal>
        <div className="eyebrow mb-1">Grow your course</div>
        <h1 className="text-4xl sm:text-5xl font-bold">Import <span className="text-gradient">new knowledge</span></h1>
        <p className="text-muted mt-2 max-w-2xl">Drop a <b>PDF</b>, <b>Markdown</b>, <b>JSON</b> or text file. New concepts join your roadmap; concepts with a matching id are <b>updated in place</b>. Everything stays on your device.</p>
      </div>

      <div
        ref={zone}
        data-reveal
        onDragOver={(e) => { e.preventDefault(); if (!over) { setOver(true); if (!reduced()) gsap.to(zone.current, { scale: 1.015, duration: 0.25 }) } }}
        onDragLeave={() => { setOver(false); gsap.to(zone.current, { scale: 1, duration: 0.25 }) }}
        onDrop={(e) => { gsap.to(zone.current, { scale: 1, duration: 0.25 }); drop(e) }}
        className={clsx('card p-8 sm:p-12 text-center border-2 border-dashed transition-colors cursor-pointer', over ? 'border-brand2 bg-brand2/10' : 'border-line2 hover:border-brand')}
        onClick={() => fileInput.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
        aria-label="Choose files to import"
      >
        <input ref={fileInput} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { void handleFiles(e.target.files ?? []); e.target.value = '' }} />
        <div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center bg-gradient-to-br from-brand/30 to-brand2/30 border border-line2 mb-4 float">
          {busy ? <Loader2 className="animate-spin text-brand2" size={28} /> : <UploadCloud className="text-brand2" size={28} />}
        </div>
        <div className="font-display text-xl font-semibold">{busy ? `Reading ${busy}…` : 'Drop files here, or tap to browse'}</div>
        <div className="text-sm text-muted mt-1">PDF · JSON · Markdown · TXT — up to 30 MB each</div>
      </div>

      {errors.map((e, i) => (
        <div key={i} className="mt-3 card p-4 flex gap-3 text-sm" style={{ borderColor: 'color-mix(in oklab, var(--bad) 50%, transparent)' }}>
          <AlertTriangle className="text-bad shrink-0" size={18} /> {e}
        </div>
      ))}

      <details className="card p-4 mt-4" data-reveal>
        <summary className="cursor-pointer font-semibold">Or paste text / JSON</summary>
        <textarea className="input mt-3 font-mono !text-sm" rows={6} placeholder={'Paste Markdown notes, or JSON from an AI chat…'} value={paste} onChange={(e) => setPaste(e.target.value)} />
        <button className="btn btn-primary mt-3" disabled={!paste.trim()} onClick={handlePaste}>Parse pasted content</button>
      </details>

      {/* review */}
      {drafts.map((d) => {
        const Icon = KIND_ICON[d.kind]
        const total = d.groups.reduce((a, g) => a + g.concepts.filter((c) => c.include).length, 0)
        const updates = d.groups.reduce((a, g) => a + g.concepts.filter((c) => c.include && course.concepts[c.c.id]).length, 0)
        return (
          <section key={d.id} className="card p-5 sm:p-6 mt-6" data-reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-xl grid place-items-center bg-brand/15 border border-brand/40 text-brand"><Icon size={20} /></span>
              <div className="flex-1 min-w-0">
                <div className="eyebrow">Review before adding</div>
                <div className="font-display text-lg font-semibold truncate">{d.title}</div>
                <div className="text-xs text-muted truncate">{d.fileName}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" aria-label="Discard" onClick={() => setDrafts((x) => x.filter((y) => y.id !== d.id))}><Trash2 size={16} /></button>
            </div>
            {d.warnings.length > 0 && (
              <ul className="mb-4 text-sm rounded-2xl p-3.5 border border-line bg-surface space-y-1">
                {d.warnings.map((w, i) => <li key={i} className="flex gap-2 text-muted"><AlertTriangle size={15} className="text-warn shrink-0 mt-0.5" /> {w}</li>)}
              </ul>
            )}
            {d.groups.map((g, gi) => (
              <div key={g.key} className="mb-5 last:mb-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="eyebrow">Goes into</span>
                  <select className="input !w-auto !min-h-[38px] !text-sm" value={g.target} onChange={(e) => patch(d.id, gi, (x) => ({ ...x, target: e.target.value }))}>
                    <option value="new">＋ New week in “Your Library”</option>
                    {course.weeks.map((w) => <option key={w.id} value={w.id}>Week {w.index} · {w.title}</option>)}
                  </select>
                  {g.target === 'new' && <input className="input !w-auto !min-h-[38px] !text-sm flex-1 min-w-[160px]" value={g.newTitle} onChange={(e) => patch(d.id, gi, (x) => ({ ...x, newTitle: e.target.value }))} placeholder="New week title" />}
                </div>
                <ul className="grid gap-2">
                  {g.concepts.map((dc, ci) => {
                    const exists = !!course.concepts[dc.c.id]
                    return (
                      <li key={dc.c.id + ci} className={clsx('flex items-start gap-3 p-3 rounded-2xl border transition-opacity', dc.include ? 'border-line bg-surface' : 'border-line opacity-45')}>
                        <button
                          aria-label={dc.include ? 'Exclude' : 'Include'}
                          onClick={() => patch(d.id, gi, (x) => ({ ...x, concepts: x.concepts.map((y, k) => (k === ci ? { ...y, include: !y.include } : y)) }))}
                          className={clsx('mt-0.5 w-6 h-6 rounded-lg border grid place-items-center shrink-0', dc.include ? 'bg-brand border-brand text-white' : 'border-line2')}
                        >
                          {dc.include && <Check size={14} strokeWidth={3} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              className="bg-transparent font-semibold outline-none border-b border-transparent focus:border-brand min-w-[120px] flex-1"
                              value={dc.c.title}
                              onChange={(e) => patch(d.id, gi, (x) => ({ ...x, concepts: x.concepts.map((y, k) => (k === ci ? { ...y, c: { ...y.c, title: e.target.value } } : y)) }))}
                            />
                            <span className={clsx('chip', exists ? 'chip-accent' : '')} style={exists ? undefined : { color: 'var(--good)' }}>{exists ? 'updates existing' : 'new'}</span>
                          </div>
                          <p className="text-xs text-muted line-clamp-2 mt-0.5">{dc.c.tldr}</p>
                          <div className="flex gap-2 mt-1.5 text-[11px] text-faint">
                            <span>{dc.c.explain.split(/\s+/).length} words</span>·<span>{dc.c.quiz.length} quiz</span>·<span>{dc.c.glossary.length} terms</span>·<span>{dc.c.minutes} min</span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-5">
              <button className="btn btn-primary" onClick={() => commit(d)} disabled={!total}><Sparkles size={16} /> Add {total} concept{total === 1 ? '' : 's'}{updates ? ` (${updates} update${updates > 1 ? 's' : ''})` : ''}</button>
              <button className="btn" onClick={() => setDrafts((x) => x.filter((y) => y.id !== d.id))}>Discard</button>
            </div>
          </section>
        )
      })}

      {/* imported packs */}
      {packs.length > 0 && (
        <section className="mt-10" data-reveal>
          <h2 className="font-display text-2xl font-semibold mb-3">Your imported packs</h2>
          <div className="grid gap-3">
            {packs.map((p) => {
              const Icon = KIND_ICON[p.kind]
              const updated = p.concepts.filter((c) => course.concepts[c.id]?.updated && course.concepts[c.id]?.source === p.title).length
              return (
                <div key={p.id} className="card p-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl grid place-items-center bg-surface2 border border-line"><Icon size={18} className="text-brand2" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-xs text-muted">{p.concepts.length} concepts{updated ? ` · ${updated} updated built-ins` : ''} · {new Date(p.importedAt).toLocaleDateString()} · {p.fileName}</div>
                  </div>
                  <Link to="/roadmap" className="btn btn-sm">View</Link>
                  <button className="btn btn-sm btn-ghost text-bad" onClick={() => confirm(`Remove “${p.title}”? Built-in concepts it updated revert to the original text. Your progress is kept.`) && (removePack(p.id), toast('Pack removed', 'info'))}><Trash2 size={15} /></button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* templates */}
      <section className="mt-12" data-reveal>
        <h2 className="font-display text-2xl font-semibold mb-1">Not sure how to format it?</h2>
        <p className="text-muted text-sm mb-4">Ask any AI chat to write a pack for you, or start from a template. Anything missing is filled in sensibly.</p>
        <Seg value={tab} onChange={setTab} options={[{ v: 'ai', label: '✨ AI prompt' }, { v: 'json', label: 'JSON' }, { v: 'md', label: 'Markdown' }]} />
        <pre className="mt-4 rounded-2xl p-4 text-xs leading-relaxed overflow-auto max-h-72 border border-line font-mono" style={{ background: 'rgba(0,0,0,.35)' }}>{tpl}</pre>
        <div className="flex flex-wrap gap-3 mt-3">
          <button className="btn" onClick={() => void copyText(tpl).then(() => toast('Copied', 'good'))}><ClipboardCopy size={16} /> Copy</button>
          {tab !== 'ai' && <button className="btn" onClick={() => void saveTextFile(tab === 'json' ? 'pack-template.json' : 'pack-template.md', tpl, tab === 'json' ? 'application/json' : 'text/markdown')}><Wand2 size={16} /> Download template</button>}
        </div>
      </section>
    </div>
  )
}
