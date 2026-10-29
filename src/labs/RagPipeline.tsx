import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import { gsap, reduced, useGSAP } from '../lib/motion.ts'

const KB = [
  { id: 'c1', src: 'refund-policy.md', text: 'Annual plans can be refunded within 30 days of purchase. Monthly plans are not refundable after the billing date.' },
  { id: 'c2', src: 'shipping.md', text: 'Orders ship within 2 business days. Express shipping arrives in 1–3 days.' },
  { id: 'c3', src: 'account.md', text: 'To reset your password, use the “Forgot password” link on the login page.' },
  { id: 'c4', src: 'pricing.md', text: 'The Pro plan costs $12 per month or $120 per year.' },
  { id: 'c5', src: 'privacy.md', text: 'We never sell personal data. Data is encrypted at rest and in transit.' },
]

const QUESTIONS = [
  { q: 'Can I get a refund on my annual plan?', sims: { c1: 0.91, c4: 0.58, c2: 0.31, c5: 0.22, c3: 0.18 }, rerank: { c1: 0.97, c4: 0.21, c2: 0.04 }, answer: 'Yes — annual plans can be refunded within 30 days of purchase [1]. Monthly plans can’t be refunded after the billing date.' },
  { q: 'How much does Pro cost per year?', sims: { c4: 0.93, c1: 0.52, c2: 0.25, c5: 0.2, c3: 0.15 }, rerank: { c4: 0.98, c1: 0.18, c2: 0.03 }, answer: 'Pro is $120 per year [1] — that works out to $10/month, versus $12 if you pay monthly.' },
  { q: 'Is my data safe with you?', sims: { c5: 0.9, c3: 0.44, c4: 0.3, c1: 0.2, c2: 0.14 }, rerank: { c5: 0.96, c3: 0.12, c4: 0.05 }, answer: 'Your data is encrypted at rest and in transit, and it is never sold [1].' },
] as const

const STEPS = ['Ask', 'Embed', 'Retrieve', 'Rerank', 'Augment', 'Generate']
const DESC = [
  'A user asks a question. The model alone has never seen your company docs.',
  'The question is turned into an embedding — a list of numbers capturing its meaning.',
  'The vector database finds chunks whose embeddings are closest to the question (top-3 shown).',
  'A reranker re-reads each candidate together with the question and re-scores true relevance.',
  'The best chunks are pasted into the prompt as context, with an instruction to answer only from them.',
  'The LLM writes the answer grounded in the retrieved text and cites its source.',
]

export default function RagPipeline() {
  const [qi, setQi] = useState(0)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [typed, setTyped] = useState(0)
  const panel = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const q = QUESTIONS[qi]

  const ranked = KB.map((k) => ({ ...k, s: q.sims[k.id as keyof typeof q.sims] })).sort((a, b) => b.s - a.s)
  const top3 = ranked.slice(0, 3)
  const rr = top3.map((k) => ({ ...k, r: q.rerank[k.id as keyof typeof q.rerank] ?? 0 })).sort((a, b) => b.r - a.r)

  useEffect(() => {
    if (!playing) return
    if (step >= STEPS.length - 1) { setPlaying(false); return }
    const t = setTimeout(() => setStep((s) => s + 1), 2600)
    return () => clearTimeout(t)
  }, [playing, step])

  useEffect(() => {
    setTyped(0)
    if (step !== 5) return
    const i = setInterval(() => setTyped((n) => (n >= q.answer.length ? (clearInterval(i), n) : n + 2)), 22)
    return () => clearInterval(i)
  }, [step, qi, q.answer.length])

  useGSAP(
    () => {
      if (reduced()) return
      if (panel.current) gsap.from(panel.current.querySelectorAll('[data-in]'), { y: 16, opacity: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' })
      if (dot.current) gsap.to(dot.current, { left: `${(step / (STEPS.length - 1)) * 100}%`, duration: 0.7, ease: 'power3.inOut' })
    },
    { dependencies: [step, qi] },
  )

  const embedding = Array.from({ length: 12 }, (_, i) => (Math.sin((qi + 1) * (i + 1) * 1.7) * 0.9).toFixed(2))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((x, i) => (
          <button key={i} className="chip hover:border-brand2 !normal-case" style={qi === i ? { color: 'var(--brand-2)', borderColor: 'var(--brand-2)' } : undefined} onClick={() => { setQi(i); setStep(0); setPlaying(false) }}>{x.q}</button>
        ))}
      </div>

      <div className="relative px-3 pt-3">
        <div className="absolute left-6 right-6 top-[26px] h-0.5 rounded-full bg-surface2" />
        <div className="absolute left-6 right-6 top-[18px] h-4"><div ref={dot} className="absolute -ml-2 w-4 h-4 rounded-full bg-brand2 shadow-[0_0_18px_var(--brand-2)]" style={{ left: 0 }} /></div>
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => { setStep(i); setPlaying(false) }} className="flex flex-col items-center gap-1.5 w-14">
              <span className={clsx('w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold border-2 transition-colors bg-solid', i <= step ? 'border-brand2 text-brand2' : 'border-line2 text-faint')}>{i + 1}</span>
              <span className={clsx('text-[11px] font-semibold', i === step ? 'text-ink' : 'text-faint')}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={panel} className="rounded-2xl border border-line p-4 sm:p-5 min-h-[250px]" style={{ background: 'rgba(0,0,0,.22)' }}>
        <p data-in className="text-sm text-muted mb-4">{DESC[step]}</p>
        {step === 0 && <div data-in className="rounded-xl border border-line bg-surface p-4 font-medium">💬 {q.q}</div>}
        {step === 1 && (
          <div data-in className="font-mono text-xs leading-7 break-words">
            <span className="text-muted">embed("{q.q}") →</span><br />
            [ {embedding.map((n, i) => <span key={i} className="mr-2" style={{ color: Number(n) > 0 ? '#22d3ee' : '#f472b6' }}>{n}</span>)} … 1536 numbers ]
          </div>
        )}
        {(step === 2 || step === 3) && (
          <ul className="grid gap-2">
            {(step === 2 ? top3.map((k) => ({ ...k, v: k.s })) : rr.map((k) => ({ ...k, v: k.r }))).map((k, i) => (
              <li key={k.id} data-in className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-center gap-2 text-xs mb-1.5"><span className="chip">{i + 1}</span><span className="font-mono text-muted">{k.src}</span><span className="ml-auto tabular-nums font-bold" style={{ color: k.v > 0.6 ? 'var(--good)' : 'var(--warn)' }}>{step === 2 ? 'similarity' : 'relevance'} {k.v.toFixed(2)}</span></div>
                <div className="text-sm">{k.text}</div>
              </li>
            ))}
          </ul>
        )}
        {step === 4 && (
          <pre data-in className="text-xs leading-relaxed whitespace-pre-wrap font-mono rounded-xl border border-line p-4 bg-surface">
{`SYSTEM: Answer ONLY from the context. If it isn't there, say you don't know. Cite sources as [n].

CONTEXT:
[1] (${rr[0].src}) ${rr[0].text}
[2] (${rr[1].src}) ${rr[1].text}

QUESTION: ${q.q}`}
          </pre>
        )}
        {step === 5 && (
          <div data-in className="rounded-xl border border-line bg-surface p-4">
            <div className="eyebrow mb-2">🤖 Answer</div>
            <p className="leading-relaxed">{q.answer.slice(0, typed)}<span className="animate-pulse text-brand2">▍</span></p>
            <div className="text-xs text-muted mt-3 font-mono">[1] {rr[0].src}</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button className="btn btn-primary" onClick={() => { if (step >= STEPS.length - 1) setStep(0); setPlaying((p) => !p) }}>{playing ? <><Pause size={16} /> Pause</> : <><Play size={16} className="fill-current" /> Play</>}</button>
        <button className="btn" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step >= STEPS.length - 1}>Next step</button>
        <button className="btn btn-ghost" onClick={() => { setStep(0); setPlaying(false) }}><RotateCcw size={16} /></button>
      </div>
    </div>
  )
}
