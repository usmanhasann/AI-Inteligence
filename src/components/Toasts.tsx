import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useToasts } from '../lib/store.ts'

export function Toasts() {
  const items = useToasts((s) => s.items)
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center gap-2 pointer-events-none"
      style={{ bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 14px)' }}
      aria-live="polite"
    >
      {items.map((t) => (
        <div key={t.id} className="glass pointer-events-auto rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 shadow-2xl animate-[toast_.35s_cubic-bezier(.2,.9,.3,1.2)]" style={{ background: 'var(--surface-solid)' }}>
          {t.tone === 'good' ? <CheckCircle2 size={16} className="text-good" /> : t.tone === 'bad' ? <XCircle size={16} className="text-bad" /> : <Info size={16} className="text-brand2" />}
          {t.text}
        </div>
      ))}
      <style>{`@keyframes toast{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
