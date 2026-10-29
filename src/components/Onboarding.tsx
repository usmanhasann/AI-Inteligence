import { useRef, useState } from 'react'
import { ArrowRight, Rocket } from 'lucide-react'
import { useStore } from '../lib/store.ts'
import { reduced, safeFrom, useGSAP } from '../lib/motion.ts'
import { SliderField } from './Fields.tsx'

export function Onboarding() {
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const setOnboarded = useStore((s) => s.setOnboarded)
  const [step, setStep] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced()) return
      safeFrom(ref.current!.querySelectorAll('[data-in]'), { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
    },
    { scope: ref, dependencies: [step] },
  )

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center p-5 overflow-auto" style={{ background: 'var(--bg)' }}>
      <div className="aurora"><i /></div>
      <div ref={ref} className="w-full max-w-md" key={step}>
        {step === 0 ? (
          <div className="text-center">
            <img data-in src="icon.svg" alt="" className="w-20 h-20 rounded-3xl mx-auto mb-6 float shadow-2xl" />
            <h1 data-in className="text-4xl font-bold mb-3">Upgrade <span className="text-gradient">yourself</span></h1>
            <p data-in className="text-muted mb-8 text-lg">
              16 weeks. 128 concepts. Every AI, full-stack and design term a vibe-coder needs — with interactive labs, flashcards and a planner built around <em>your</em> schedule.
            </p>
            <button data-in className="btn btn-primary w-full" onClick={() => setStep(1)}>
              Let’s set you up <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="card p-6 sm:p-7">
            <h2 data-in className="text-2xl font-semibold mb-1">Your learning rhythm</h2>
            <p data-in className="text-muted text-sm mb-6">Weekdays are short, weekends are your deep-work time. You can change this anytime.</p>
            <label data-in className="eyebrow block mb-2">What should we call you?</label>
            <input data-in className="input mb-6" placeholder="Your name (optional)" value={settings.name} onChange={(e) => setSettings({ name: e.target.value })} />
            <div data-in className="mb-6">
              <SliderField label="Each weekday" value={settings.weekdayMin} min={0} max={120} step={5} unit="min" onChange={(v) => setSettings({ weekdayMin: v })} />
            </div>
            <div data-in className="mb-7">
              <SliderField label="Each weekend day" value={settings.weekendMin} min={30} max={600} step={15} unit="min" onChange={(v) => setSettings({ weekendMin: v })} />
            </div>
            <button data-in className="btn btn-primary w-full" onClick={setOnboarded}>
              Start learning <Rocket size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
