import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardCopy, Clock, FolderPlus, Lightbulb, PartyPopper, Puzzle, Sparkles, Target, Wand2 } from 'lucide-react'
import { useCourse } from '../lib/course.ts'
import { useStore, toast } from '../lib/store.ts'
import { TRACKS, accent } from '../lib/tracks.ts'
import { confetti, useReveal } from '../lib/motion.ts'
import { copyText, haptic } from '../lib/platform.ts'
import { Md } from '../components/ui.tsx'
import { SaveButton } from '../components/cards.tsx'
import { Quiz } from '../components/Quiz.tsx'
import { CollectionPicker } from '../components/CollectionPicker.tsx'
import { LabHost } from '../labs/index.tsx'

function ReadBar() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      if (ref.current) ref.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return <div ref={ref} className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left bg-gradient-to-r from-brand via-brand2 to-brand3" style={{ transform: 'scaleX(0)' }} />
}

function Block({ icon: Icon, title, children, tone }: { icon: typeof BookOpen; title: string; children: React.ReactNode; tone?: string }) {
  return (
    <section className="card p-5 sm:p-6" data-scroll>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-8 h-8 rounded-lg grid place-items-center border" style={{ color: tone ?? 'var(--brand-2)', borderColor: `color-mix(in oklab, ${tone ?? 'var(--brand-2)'} 40%, transparent)`, background: `color-mix(in oklab, ${tone ?? 'var(--brand-2)'} 12%, transparent)` }}>
          <Icon size={16} />
        </span>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function ConceptPage() {
  const { id = '' } = useParams()
  const course = useCourse()
  const nav = useNavigate()
  const c = course.concepts[id]
  const { progress, touch, setLearned, recordQuiz, setNote } = useStore()
  const saved = useStore((s) => !!s.saved[id])
  const ref = useRef<HTMLDivElement>(null)
  const [picker, setPicker] = useState(false)
  const learned = !!progress[id]?.learnedAt
  const week = c ? course.weekById[course.weekOf[id]] : undefined
  const idx = course.order.indexOf(id)
  const next = idx >= 0 ? course.concepts[course.order[idx + 1]] : undefined
  const prev = idx > 0 ? course.concepts[course.order[idx - 1]] : undefined
  const hue = week ? TRACKS[week.track].hue : 265

  useReveal(ref, [id])
  useEffect(() => {
    if (c) touch(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!c) return <div className="card p-10 text-center">Concept not found. <Link className="text-brand2" to="/roadmap">Back to roadmap</Link></div>

  const markLearned = (e: React.MouseEvent) => {
    const now = !learned
    setLearned(id, now, c.minutes)
    void haptic(now ? 'success' : 'light')
    if (now) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
      confetti(r.left + r.width / 2, r.top, 60)
      toast('+50 XP · added to your review queue', 'good')
    }
  }
  const askPrompt = () => {
    const p = `Act as my AI tutor. I'm a working professional who builds with AI assistants ("vibe coding"), so I need concepts and vocabulary, not syntax.\n\nTopic: ${c.title}\nWhat I already read: ${c.tldr}\n\nPlease: 1) re-explain it with a fresh analogy, 2) show a realistic example from a web/AI app, 3) list 3 common misconceptions, 4) give me 3 questions to test my understanding, answering only after I reply.`
    void copyText(p).then(() => toast('Tutor prompt copied — paste it into Claude or any chat', 'good'))
  }

  return (
    <div ref={ref} style={{ '--accent': accent(hue) } as CSSProperties}>
      <ReadBar />
      <div className="flex items-center justify-between gap-3 mb-5" data-reveal>
        <button onClick={() => (week ? nav(`/week/${week.id}`) : nav(-1))} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} /> {week ? `Week ${week.index} · ${week.title}` : 'Back'}
        </button>
        {c.source && <span className="chip">from {c.source}{c.updated ? ' · updated' : ''}</span>}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <header className="card p-6 sm:p-8 relative overflow-hidden" data-reveal>
            <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: accent(hue) }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="chip chip-accent">{week ? TRACKS[week.track].label : 'Concept'}</span>
                <span className="chip"><Clock size={11} /> {c.minutes} min</span>
                {idx >= 0 && <span className="chip">{idx + 1} / {course.order.length}</span>}
              </div>
              <div className="flex items-start gap-4">
                <div className="text-5xl sm:text-6xl float select-none">{c.emoji}</div>
                <h1 className="text-3xl sm:text-5xl font-bold leading-[1.05]">{c.title}</h1>
              </div>
              <p className="mt-5 text-lg sm:text-xl leading-relaxed text-ink/90 border-l-2 pl-4" style={{ borderColor: accent(hue) }}>{c.tldr}</p>
            </div>
          </header>

          <Block icon={BookOpen} title="The explanation"><Md>{c.explain}</Md></Block>
          {c.analogy && <Block icon={Lightbulb} title="Think of it like…" tone="var(--warn)"><Md>{c.analogy}</Md></Block>}
          {c.why && <Block icon={Target} title="Why it matters to you" tone="var(--good)"><Md>{c.why}</Md></Block>}
          {c.example && <Block icon={Wand2} title="See it in action" tone="var(--brand-3)"><Md>{c.example}</Md></Block>}
          {c.lab && <div data-scroll><LabHost id={c.lab} /></div>}

          {c.takeaways.length > 0 && (
            <Block icon={Sparkles} title="Remember this" tone="var(--brand)">
              <ul className="grid gap-2.5">
                {c.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="mt-1 w-5 h-5 rounded-full grid place-items-center bg-brand/20 text-brand shrink-0"><Check size={12} strokeWidth={3} /></span>
                    <Md className="!text-[0.97rem]">{t}</Md>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {c.glossary.length > 0 && (
            <Block icon={Puzzle} title="Jargon you’ll hear nearby" tone="var(--brand-2)">
              <dl className="grid sm:grid-cols-2 gap-3">
                {c.glossary.map((g) => (
                  <div key={g.term} className="rounded-2xl border border-line bg-surface p-3.5">
                    <dt className="font-display font-semibold text-brand2">{g.term}</dt>
                    <dd className="text-sm text-muted mt-0.5">{g.def}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          )}

          {c.quiz.length > 0 && (
            <section className="card p-5 sm:p-6" data-scroll>
              <Quiz questions={c.quiz} onDone={(s) => recordQuiz(id, s)} />
            </section>
          )}

          <section className="card p-5 sm:p-6" data-scroll>
            <div className="eyebrow mb-2">My notes</div>
            <textarea className="input" placeholder="Write it in your own words — that’s what makes it stick." value={progress[id]?.note ?? ''} onChange={(e) => setNote(id, e.target.value)} />
          </section>

          <div className="card p-6 text-center relative overflow-hidden" data-scroll>
            <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(70% 140% at 50% 120%, ${accent(hue)}55, transparent 70%)` }} />
            <div className="relative">
              <button onClick={markLearned} className={learned ? 'btn' : 'btn btn-primary'} style={{ minHeight: 52, padding: '0 1.8rem', fontSize: '1rem' }}>
                {learned ? <><Check size={18} /> Learned — tap to undo</> : <><PartyPopper size={18} /> I’ve got this — mark learned</>}
              </button>
              <div className="flex justify-between gap-3 mt-5 text-sm">
                {prev ? <Link to={`/concept/${prev.id}`} className="btn btn-sm"><ArrowLeft size={14} /> {prev.title}</Link> : <span />}
                {next ? <Link to={`/concept/${next.id}`} className="btn btn-sm btn-primary">{next.title} <ArrowRight size={14} /></Link> : <span />}
              </div>
            </div>
          </div>
        </div>

        {/* side rail */}
        <aside className="space-y-4 lg:sticky lg:top-20" data-reveal>
          <div className="card p-4 grid gap-2.5">
            <button onClick={markLearned} className={learned ? 'btn' : 'btn btn-primary'}>{learned ? <><Check size={16} /> Learned</> : 'Mark as learned'}</button>
            <div className="grid grid-cols-2 gap-2.5">
              <SaveButton id={id} label />
              <button className="btn" disabled={!saved} onClick={() => setPicker(true)} title={saved ? '' : 'Save it first'}><FolderPlus size={16} /> Collect</button>
            </div>
            <button className="btn" onClick={askPrompt}><ClipboardCopy size={16} /> Copy tutor prompt</button>
          </div>
          {c.related.length > 0 && (
            <div className="card p-4">
              <div className="eyebrow mb-3">Related</div>
              <div className="grid gap-2">
                {c.related.map((r) => course.concepts[r] && (
                  <Link key={r} to={`/concept/${r}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface hover:bg-surface2 border border-line text-sm font-medium transition-colors">
                    <span className="text-lg">{course.concepts[r].emoji}</span>{course.concepts[r].title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
      <CollectionPicker id={id} open={picker} onClose={() => setPicker(false)} />
    </div>
  )
}

