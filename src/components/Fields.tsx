import type { CSSProperties } from 'react'

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const p = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-display font-semibold text-brand2">
          {format ? format(value) : value} <span className="text-xs text-muted font-sans">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--p': `${p}%` } as CSSProperties}
      />
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative w-12 h-7 rounded-full transition-colors shrink-0"
      style={{ background: on ? 'linear-gradient(90deg,var(--brand),var(--brand-2))' : 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all" style={{ left: on ? 22 : 2 }} />
    </button>
  )
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap p-1 rounded-2xl bg-surface border border-line gap-1 max-w-full" role="tablist">
      {options.map((o) => (
        <button
          key={o.v}
          role="tab"
          aria-selected={value === o.v}
          onClick={() => onChange(o.v)}
          className="px-3.5 h-9 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
          style={
            value === o.v
              ? ({ background: 'var(--surface-2)', color: 'var(--text)', boxShadow: 'inset 0 0 0 1px var(--border-strong)' } as CSSProperties)
              : { color: 'var(--muted)' }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
