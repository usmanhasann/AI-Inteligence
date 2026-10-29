import { useRef, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import { gsap, reduced, useCountUp, useGSAP } from '../lib/motion.ts'

export function Md({ children, className }: { children: string; className?: string }) {
  return (
    <div className={clsx('md', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

export function Counter({ value, fmt, className }: { value: number; fmt?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useCountUp(ref, value, fmt)
  return (
    <span ref={ref} className={className}>
      {fmt ? fmt(value) : Math.round(value)}
    </span>
  )
}

/** Circular progress. value is 0..1 and animates with GSAP. */
export function Ring({
  value,
  size = 64,
  stroke = 7,
  color = 'var(--brand)',
  color2,
  children,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  color2?: string
  children?: ReactNode
  className?: string
}) {
  const circ = useRef<SVGCircleElement>(null)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const id = useRef('g' + Math.random().toString(36).slice(2, 7)).current
  useGSAP(
    () => {
      const to = c * (1 - Math.min(1, Math.max(0, value)))
      if (reduced()) gsap.set(circ.current, { strokeDashoffset: to })
      else gsap.to(circ.current, { strokeDashoffset: to, duration: 1.1, ease: 'power3.out' })
    },
    { dependencies: [value, c] },
  )
  return (
    <div className={clsx('relative inline-grid place-items-center shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor={color2 ?? color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          ref={circ}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function Bar({ value, color = 'var(--brand)', className }: { value: number; color?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const w = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`
      if (reduced()) gsap.set(ref.current, { width: w })
      else gsap.fromTo(ref.current, { width: 0 }, { width: w, duration: 0.9, ease: 'power3.out' })
    },
    { dependencies: [value] },
  )
  return (
    <div className={clsx('h-1.5 w-full rounded-full overflow-hidden', className)} style={{ background: 'var(--surface-2)' }}>
      <div ref={ref} className="h-full rounded-full" style={{ background: color }} />
    </div>
  )
}

export function SectionTitle({ eyebrow, title, right }: { eyebrow?: string; title: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4" data-reveal>
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="text-2xl md:text-[1.7rem] font-semibold">{title}</h2>
      </div>
      {right}
    </div>
  )
}

export function Empty({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <div className="text-5xl mb-3 float">{emoji}</div>
      <div className="font-display text-xl font-semibold mb-1">{title}</div>
      <div className="text-muted max-w-md mx-auto">{children}</div>
    </div>
  )
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (!open || reduced()) return
      gsap.from(ref.current, { y: 40, opacity: 0, scale: 0.97, duration: 0.35, ease: 'power3.out' })
    },
    { dependencies: [open] },
  )
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-black/60 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="card w-full sm:max-w-lg max-h-[88vh] overflow-auto p-6 rounded-b-none sm:rounded-b-[20px] bg-solid"
        style={{ background: 'var(--surface-solid)' }}
      >
        {children}
      </div>
    </div>
  )
}
