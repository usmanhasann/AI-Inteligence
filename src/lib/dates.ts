export const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const todayISO = () => toISO(new Date())

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function addDays(iso: string, n: number): string {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
/** Monday of the week containing iso */
export function weekStart(iso: string): string {
  const d = fromISO(iso)
  const dow = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dow)
  return toISO(d)
}
export function weekDays(iso: string): string[] {
  const s = weekStart(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}
export const isWeekend = (iso: string) => {
  const g = fromISO(iso).getDay()
  return g === 0 || g === 6
}
export const dayName = (iso: string, long = false) =>
  fromISO(iso).toLocaleDateString(undefined, { weekday: long ? 'long' : 'short' })
export const dayNum = (iso: string) => fromISO(iso).getDate()
export const monthShort = (iso: string) => fromISO(iso).toLocaleDateString(undefined, { month: 'short' })
export function rangeLabel(days: string[]): string {
  const a = fromISO(days[0]), b = fromISO(days[days.length - 1])
  const f = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${f(a)} – ${f(b)}`
}
