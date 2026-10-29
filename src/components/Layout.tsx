import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BookMarked, BrainCircuit, CalendarCheck2, Cloud, CloudOff, Compass, Download, Flame, Home, Layers, MoreHorizontal, Search, Settings as Cog, Sparkles, X } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../lib/store.ts'
import { levelInfo, streak, xpOf } from '../lib/stats.ts'
import { gsap, reduced } from '../lib/motion.ts'
import { CommandPalette } from './CommandPalette.tsx'
import { Toasts } from './Toasts.tsx'
import { useAuth } from './AuthProvider.tsx'

const MAIN = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/roadmap', label: 'Learn', icon: Compass },
  { to: '/plan', label: 'Plan', icon: CalendarCheck2 },
  { to: '/gallery', label: 'Saved', icon: BookMarked },
]
const MORE = [
  { to: '/review', label: 'Review', icon: Layers, hint: 'Flashcards due today' },
  { to: '/glossary', label: 'Glossary', icon: BrainCircuit, hint: 'Every term, A–Z' },
  { to: '/import', label: 'Import', icon: Download, hint: 'Add PDF / JSON / MD' },
  { to: '/settings', label: 'Settings', icon: Cog, hint: 'Time budget, theme, backup' },
]

export function Layout() {
  const loc = useLocation()
  const nav = useNavigate()
  const main = useRef<HTMLDivElement>(null)
  const [palette, setPalette] = useState(false)
  const [more, setMore] = useState(false)
  const activity = useStore((s) => s.activity)
  const progress = useStore((s) => s.progress)
  const st = streak(activity)
  const lv = levelInfo(xpOf(progress, activity))
  const { user, syncing } = useAuth()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // page transition + scroll reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setMore(false)
    if (reduced() || !main.current) return
    const tw = gsap.fromTo(main.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' })
    return () => {
      tw.kill()
    }
  }, [loc.pathname])

  return (
    <div className="min-h-dvh lg:pl-[248px]">
      <div className="aurora"><i /></div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] flex-col gap-1 p-5 border-r border-line glass z-30">
        <button onClick={() => nav('/')} className="flex items-center gap-3 mb-6 text-left">
          <img src="icon.svg" alt="" className="w-10 h-10 rounded-xl shadow-lg" />
          <div className="leading-tight">
            <div className="font-display font-bold text-lg">Upgrade</div>
            <div className="text-[11px] text-muted -mt-0.5">AI learning studio</div>
          </div>
        </button>
        {[...MAIN, ...MORE].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 px-3.5 h-11 rounded-xl text-[0.93rem] font-medium transition-colors',
                isActive ? 'bg-surface2 text-ink shadow-[inset_0_0_0_1px_var(--border)]' : 'text-muted hover:text-ink hover:bg-surface',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={clsx('transition-colors', isActive ? 'text-brand2' : 'group-hover:text-brand2')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
        <div className="mt-auto card p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold">Lv {lv.level} · {lv.title}</span>
            <span className="text-muted">{lv.xp} XP</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-surface2">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand2" style={{ width: `${Math.round(lv.pct * 100)}%` }} />
          </div>
          <div className="text-[11px] text-muted mt-2">{lv.ceil - lv.xp} XP to level {lv.level + 1}</div>
        </div>
      </aside>

      {/* Top bar */}
      <header
        className="sticky top-0 z-20 glass border-b border-line"
        style={{ paddingTop: 'var(--safe-top)', background: 'color-mix(in oklab, var(--bg) 90%, transparent)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => nav('/')} className="lg:hidden flex items-center gap-2 font-display font-bold">
            <img src="icon.svg" alt="" className="w-7 h-7 rounded-lg" />
            Upgrade
          </button>
          <button
            onClick={() => setPalette(true)}
            className="hidden sm:flex flex-1 max-w-md items-center gap-2 h-10 px-3.5 rounded-xl bg-surface border border-line text-muted text-sm hover:border-line2 transition-colors"
          >
            <Search size={16} /> Search concepts, terms…
            <kbd className="ml-auto text-[11px] px-1.5 py-0.5 rounded-md bg-surface2 border border-line font-mono">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setPalette(true)} className="sm:hidden btn btn-ghost btn-icon btn-sm" aria-label="Search">
              <Search size={18} />
            </button>
            <div className="chip" title="Day streak" style={st.current ? { color: 'var(--warn)', borderColor: 'color-mix(in oklab, var(--warn) 40%, transparent)' } : undefined}>
              <Flame size={14} className={st.activeToday ? 'fill-current' : ''} /> {st.current}
            </div>
            <div className="chip chip-accent" title={`${lv.xp} XP`}><Sparkles size={13} /> Lv {lv.level}</div>
            {/* Cloud sync indicator */}
            <button
              onClick={() => nav('/settings')}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label={user ? 'Synced to cloud' : 'Sign in to sync'}
              title={user ? (syncing ? 'Syncing…' : 'Synced to cloud — click for account') : 'Local only — click to sign in'}
            >
              {user
                ? <Cloud size={16} className={syncing ? 'text-brand2 animate-pulse' : 'text-good'} />
                : <CloudOff size={16} className="text-faint" />
              }
            </button>
          </div>
        </div>
      </header>

      <div ref={main} className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-nav">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-line"
        style={{ paddingBottom: 'var(--safe-bottom)', background: 'color-mix(in oklab, var(--bg) 94%, transparent)' }}
      >
        <div className="grid grid-cols-5 h-[var(--nav-h)]">
          {MAIN.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="grid place-items-center">
              {({ isActive }) => (
                <span className={clsx('flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors', isActive ? 'text-ink' : 'text-faint')}>
                  <span className={clsx('grid place-items-center w-12 h-7 rounded-full transition-all', isActive && 'bg-gradient-to-r from-brand/40 to-brand2/30')}>
                    <Icon size={20} className={isActive ? 'text-brand2' : ''} />
                  </span>
                  {label}
                </span>
              )}
            </NavLink>
          ))}
          <button onClick={() => setMore(true)} className="grid place-items-center">
            <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-faint">
              <span className="grid place-items-center w-12 h-7"><MoreHorizontal size={20} /></span>More
            </span>
          </button>
        </div>
      </nav>

      {more && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMore(false)}>
          <div
            className="absolute bottom-0 inset-x-0 rounded-t-3xl p-5 border-t border-line2"
            style={{ background: 'var(--surface-solid)', paddingBottom: 'calc(var(--safe-bottom) + 20px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg font-semibold">More</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setMore(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MORE.map(({ to, label, icon: Icon, hint }) => (
                <NavLink key={to} to={to} className="card p-4 flex flex-col gap-1 active:scale-[0.98] transition-transform">
                  <Icon size={22} className="text-brand2" />
                  <div className="font-semibold mt-1">{label}</div>
                  <div className="text-xs text-muted leading-snug">{hint}</div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <Toasts />
    </div>
  )
}
