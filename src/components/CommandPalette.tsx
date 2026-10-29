import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, FileText, Layers, Search } from 'lucide-react'
import clsx from 'clsx'
import { useCourse } from '../lib/course.ts'

interface Item {
  key: string
  title: string
  sub: string
  to: string
  kind: 'concept' | 'term' | 'page'
  emoji?: string
  score: number
}

const PAGES = [
  { t: 'Home', to: '/' }, { t: 'Roadmap', to: '/roadmap' }, { t: 'Weekly planner', to: '/plan' }, { t: 'Saved gallery', to: '/gallery' },
  { t: 'Flashcard review', to: '/review' }, { t: 'Glossary', to: '/glossary' }, { t: 'Import PDF / JSON / MD', to: '/import' }, { t: 'Settings', to: '/settings' },
]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const course = useCourse()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const index = useMemo(() => {
    const out: Omit<Item, 'score'>[] = []
    for (const c of Object.values(course.concepts)) {
      out.push({ key: c.id, title: c.title, sub: c.tldr, to: `/concept/${c.id}`, kind: 'concept', emoji: c.emoji })
      for (const g of c.glossary) out.push({ key: `${c.id}:${g.term}`, title: g.term, sub: g.def, to: `/concept/${c.id}`, kind: 'term' })
    }
    return out
  }, [course])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return PAGES.map((p, i): Item => ({ key: p.to, title: p.t, sub: 'Go to page', to: p.to, kind: 'page', score: -i }))
    const scored: Item[] = []
    for (const it of index) {
      const t = it.title.toLowerCase()
      let score = 0
      if (t === s) score = 100
      else if (t.startsWith(s)) score = 80
      else if (t.includes(s)) score = 60
      else if (it.sub.toLowerCase().includes(s)) score = 20
      if (score && it.kind === 'term') score -= 8
      if (score) scored.push({ ...it, score })
    }
    for (const p of PAGES) if (p.t.toLowerCase().includes(s)) scored.push({ key: p.to, title: p.t, sub: 'Go to page', to: p.to, kind: 'page', score: 70 })
    return scored.sort((a, b) => b.score - a.score).slice(0, 30)
  }, [q, index])

  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])
  useEffect(() => setIdx(0), [q])
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  if (!open) return null
  const go = (it: Item) => {
    onClose()
    nav(it.to)
  }
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-start justify-items-center pt-[10vh] px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-line2 overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface-solid)' }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
          if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
          if (e.key === 'Enter' && results[idx]) go(results[idx])
        }}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-line">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search any concept or term… (try “RAG”, “JWT”, “contrast”)"
            className="flex-1 bg-transparent outline-none text-[0.98rem] placeholder:text-faint"
          />
          <kbd className="text-[11px] px-1.5 py-0.5 rounded-md bg-surface2 border border-line font-mono text-muted">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-auto p-2">
          {results.length === 0 && <div className="p-8 text-center text-muted text-sm">Nothing found. You can import notes about “{q}” from the Import page.</div>}
          {results.map((r, i) => (
            <button
              key={r.key}
              data-active={i === idx}
              onMouseMove={() => setIdx(i)}
              onClick={() => go(r)}
              className={clsx('w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl', i === idx ? 'bg-surface2' : '')}
            >
              <span className="w-8 h-8 rounded-lg grid place-items-center bg-surface border border-line text-lg shrink-0">
                {r.emoji ?? (r.kind === 'term' ? <Layers size={15} className="text-brand2" /> : <FileText size={15} className="text-brand2" />)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold truncate">{r.title}</span>
                <span className="block text-xs text-muted truncate">{r.sub}</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-faint font-bold">{r.kind}</span>
              {i === idx && <CornerDownLeft size={14} className="text-faint" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
