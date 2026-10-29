import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../lib/store.ts'
import { accent } from '../lib/tracks.ts'
import { Modal } from './ui.tsx'

const EMOJIS = ['📌', '🔥', '💡', '🧪', '🛠️', '🎯', '🚀', '❓', '🧠', '🎨']

export function CollectionPicker({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
  const { collections, saved, addCollection, updateSaved, removeCollection } = useStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const item = saved[id]
  const toggle = (cid: string) => {
    const cur = item?.collections ?? []
    updateSaved(id, { collections: cur.includes(cid) ? cur.filter((c) => c !== cid) : [...cur, cid] })
  }
  const create = () => {
    const n = name.trim()
    if (!n) return
    const cid = addCollection({ name: n, emoji, hue: Math.floor(Math.random() * 360) })
    updateSaved(id, { collections: [...(item?.collections ?? []), cid] })
    setName('')
  }
  return (
    <Modal open={open} onClose={onClose} title="Collections">
      <h3 className="font-display text-xl font-semibold mb-1">Add to collections</h3>
      <p className="text-sm text-muted mb-4">It always stays grouped under its week. Collections are your own extra categories.</p>
      <div className="grid gap-2 mb-5">
        {collections.length === 0 && <div className="text-sm text-faint py-2">No collections yet — create your first below.</div>}
        {collections.map((c) => {
          const on = !!item?.collections.includes(c.id)
          return (
            <div key={c.id} className="flex items-center gap-2">
              <button onClick={() => toggle(c.id)} className="flex-1 flex items-center gap-3 px-3.5 h-12 rounded-2xl border transition-colors text-left" style={{ borderColor: on ? accent(c.hue) : 'var(--border)', background: on ? `${accent(c.hue)}18` : 'var(--surface)' }}>
                <span className="text-xl">{c.emoji}</span>
                <span className="font-medium flex-1 truncate">{c.name}</span>
                {on && <Check size={16} style={{ color: accent(c.hue) }} />}
              </button>
              <button className="btn btn-ghost btn-icon btn-sm text-faint" aria-label={`Delete ${c.name}`} onClick={() => confirm(`Delete collection “${c.name}”? Saved concepts stay saved.`) && removeCollection(c.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => setEmoji(e)} className="w-9 h-9 rounded-xl text-lg border" style={{ borderColor: e === emoji ? 'var(--brand)' : 'var(--border)', background: e === emoji ? 'rgba(139,92,246,.18)' : 'transparent' }}>{e}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input" placeholder="New collection (e.g. “Interview prep”)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} />
        <button className="btn btn-primary btn-icon" onClick={create} aria-label="Create"><Plus size={18} /></button>
      </div>
      <button className="btn w-full mt-4" onClick={onClose}>Done</button>
    </Modal>
  )
}
