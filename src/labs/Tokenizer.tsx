import { useMemo, useRef, useState } from 'react'
import { gsap, reduced, useGSAP } from '../lib/motion.ts'

const PRESETS: Record<string, string> = {
  Sentence: 'Unbelievably, ChatGPT tokenizes everything strangely 🙂',
  Code: 'const sum = (a, b) => a + b; console.log(sum(2, 40));',
  Hindi: 'नमस्ते, आप कैसे हैं? मैं सीख रहा हूँ।',
  Long: 'Antidisestablishmentarianism is a famously long word, but tokenization breaks it into reusable pieces.',
}
const AFFIX = ['anti', 'dis', 'un', 're', 'pre', 'inter', 'trans', 'ing', 'tion', 'ment', 'ness', 'able', 'ably', 'ize', 'izes', 'ism', 'ian', 'ly', 'ed', 'er', 'es', 's']
const COLORS = [264, 190, 330, 150, 35, 215, 355, 100].map((h) => `hsl(${h} 85% 62%)`)

function splitWord(w: string): string[] {
  const m = w.match(/^(\s?)(.*)$/)!
  const lead = m[1]
  let rest = m[2]
  if (rest.length <= 5) return [lead + rest]
  const out: string[] = []
  let first = true
  while (rest.length > 5) {
    const pre = AFFIX.filter((a) => rest.length > a.length + 2 && rest.toLowerCase().startsWith(a)).sort((a, b) => b.length - a.length)[0]
    const suf = AFFIX.filter((a) => rest.length > a.length + 2 && rest.toLowerCase().endsWith(a)).sort((a, b) => b.length - a.length)[0]
    if (pre) { out.push((first ? lead : '') + rest.slice(0, pre.length)); rest = rest.slice(pre.length) }
    else if (suf && rest.length - suf.length > 2) { const head = rest.slice(0, rest.length - suf.length); out.push((first ? lead : '') + (head.length > 6 ? head.slice(0, 5) : head)); if (head.length > 6) out.push(head.slice(5)); out.push(suf); rest = ''; first = false; return out }
    else { out.push((first ? lead : '') + rest.slice(0, 5)); rest = rest.slice(5) }
    first = false
  }
  if (rest) out.push(rest)
  return out
}

/** Rough GPT-style approximation: whole common words, pieces for long ones, 1 token per non-Latin char, ~2 per emoji. */
export function approxTokens(text: string): string[] {
  const parts = text.match(/\s?[A-Za-z]+|\s?\d{1,3}|\s+|[^\sA-Za-z\d]/gu) ?? []
  const out: string[] = []
  for (const p of parts) {
    if (/^\s?[A-Za-z]+$/.test(p)) out.push(...splitWord(p))
    else if (/\p{Extended_Pictographic}/u.test(p)) out.push(p, '')
    else out.push(p)
  }
  return out.filter((t, i, a) => t !== '' || /\p{Extended_Pictographic}/u.test(a[i - 1] ?? ''))
}

const idOf = (t: string) => {
  let h = 2166136261
  for (const c of t) h = Math.imul(h ^ c.codePointAt(0)!, 16777619)
  return (h >>> 0) % 50000
}

export default function Tokenizer() {
  const [text, setText] = useState(PRESETS.Sentence)
  const [ids, setIds] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const tokens = useMemo(() => approxTokens(text), [text])
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  useGSAP(
    () => {
      if (reduced() || !box.current) return
      gsap.from(box.current.querySelectorAll('[data-t]'), { scale: 0.6, opacity: 0, duration: 0.35, stagger: 0.015, ease: 'back.out(2)', overwrite: true })
    },
    { scope: box, dependencies: [text.length > 0 && Object.values(PRESETS).includes(text) ? text : ''] },
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([k, v]) => (
          <button key={k} className="chip hover:border-brand2" style={text === v ? { color: 'var(--brand-2)', borderColor: 'var(--brand-2)' } : undefined} onClick={() => setText(v)}>{k}</button>
        ))}
      </div>
      <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to tokenize" />
      <div className="grid grid-cols-3 gap-3 text-center">
        {[['Tokens', tokens.length], ['Words', words], ['Characters', text.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-surface border border-line py-3">
            <div className="font-display text-2xl font-bold">{v}</div>
            <div className="text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>
      <div ref={box} className="rounded-2xl border border-line p-4 font-mono text-[0.92rem] leading-[2.2] min-h-[84px]" style={{ background: 'rgba(0,0,0,.22)' }}>
        {tokens.map((t, i) => (
          <span key={i} data-t className="inline-block rounded-md px-[3px] mr-[3px] whitespace-pre" style={{ background: COLORS[i % COLORS.length] + '33', boxShadow: `inset 0 -2px 0 ${COLORS[i % COLORS.length]}` }}>
            {ids ? idOf(t) : t === '' ? '·' : t.replace(/ /g, '␣')}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted gap-3">
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={ids} onChange={(e) => setIds(e.target.checked)} /> Show token IDs</label>
        <span>{words ? `${(tokens.length / words).toFixed(2)} tokens per word` : ''}</span>
      </div>
      <p className="text-xs text-faint">Approximation for learning — real tokenizers (and token IDs) differ between models, but the pattern is the same.</p>
    </div>
  )
}
