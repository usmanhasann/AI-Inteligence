import { useEffect, useRef, useState } from 'react'
import { Cloud, CloudOff, Download, LogOut, Moon, RefreshCw, RotateCcw, Smartphone, Sun, Upload } from 'lucide-react'
import { snapshot, toast, useStore, type Persisted } from '../lib/store.ts'
import { saveTextFile, isNative } from '../lib/platform.ts'
import { effort, fmtMin, PACE } from '../lib/plan.ts'
import { useReveal } from '../lib/motion.ts'
import { Seg, SliderField } from '../components/Fields.tsx'
import { useAuth } from '../components/AuthProvider.tsx'
import { pushAll } from '../lib/sync.ts'

interface BIPEvent extends Event { prompt: () => Promise<void> }

export default function SettingsPage() {
  const { settings, setSettings, restore, resetAll } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [bip, setBip] = useState<BIPEvent | null>(null)
  useReveal(ref, [])
  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setBip(e as BIPEvent) }
    window.addEventListener('beforeinstallprompt', on)
    return () => window.removeEventListener('beforeinstallprompt', on)
  }, [])

  const backup = () =>
    void saveTextFile(
      `upgrade-myself-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ app: 'upgrade-myself', v: 1, data: snapshot() }),
      'application/json',
    ).then(() => toast('Backup saved', 'good'))

  const restoreFile = async (f: File) => {
    try {
      const j = JSON.parse(await f.text()) as { app?: string; data?: Partial<Persisted> }
      if (j.app !== 'upgrade-myself' || !j.data) throw new Error('not a backup')
      restore(j.data)
      toast('Backup restored', 'good')
    } catch {
      toast('That file is not a valid backup', 'bad')
    }
  }

  return (
    <div ref={ref} className="max-w-2xl mx-auto space-y-5">
      <div className="mb-3" data-reveal>
        <div className="eyebrow mb-1">Make it yours</div>
        <h1 className="text-4xl sm:text-5xl font-bold"><span className="text-gradient">Settings</span></h1>
      </div>

      {/* ── Profile ── */}
      <section className="card p-6 space-y-5" data-reveal>
        <div className="eyebrow">Profile</div>
        <input
          className="input"
          placeholder="Your name"
          value={settings.name}
          onChange={(e) => setSettings({ name: e.target.value })}
        />
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-xs text-muted">Dark is easiest on the eyes at night.</div>
          </div>
          <Seg
            value={settings.theme}
            onChange={(v) => setSettings({ theme: v })}
            options={[{ v: 'dark', label: '🌙 Dark' }, { v: 'light', label: '☀️ Light' }]}
          />
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium">Animations</div>
            <div className="text-xs text-muted">"System" follows your device's reduce-motion setting.</div>
          </div>
          <Seg
            value={settings.motion}
            onChange={(v) => setSettings({ motion: v })}
            options={[{ v: 'system', label: 'System' }, { v: 'on', label: 'Full' }, { v: 'off', label: 'Reduced' }]}
          />
        </div>
      </section>

      {/* ── Learning time budget ── */}
      <section className="card p-6 space-y-6" data-reveal>
        <div className="eyebrow">Learning time budget</div>
        <SliderField
          label="Each weekday"
          value={settings.weekdayMin}
          min={0} max={120} step={5} unit="min"
          onChange={(v) => setSettings({ weekdayMin: v })}
        />
        <SliderField
          label="Each weekend day"
          value={settings.weekendMin}
          min={30} max={600} step={15} unit="min"
          onChange={(v) => setSettings({ weekendMin: v })}
          format={fmtMin}
        />
        <div>
          <div className="text-sm font-medium mb-2">Study pace</div>
          <Seg
            value={settings.pace}
            onChange={(v) => setSettings({ pace: v })}
            options={(Object.keys(PACE) as (keyof typeof PACE)[]).map((k) => ({ v: k, label: PACE[k].label }))}
          />
          <p className="text-xs text-muted mt-2">
            {PACE[settings.pace].hint}. A 9-minute read is planned as ~{effort(9, settings)} min.
          </p>
        </div>
        <p className="text-xs text-muted">The planner never schedules more than this per day (or more than 10 concepts a day).</p>
      </section>

      {/* ── Cloud sync / account ── */}
      <AccountSection />

      {/* ── Your data ── */}
      <section className="card p-6 space-y-4" data-reveal>
        <div className="eyebrow">Your data</div>
        <p className="text-sm text-muted">
          Progress, notes, saved concepts, plan and imported packs are stored on-device (IndexedDB)
          and synced to the cloud when you're signed in. Export a local backup to transfer data without an account.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn" onClick={backup}>
            <Download size={16} /> Export backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Restore backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void restoreFile(f)
              e.target.value = ''
            }}
          />
          <button
            className="btn text-bad"
            onClick={() =>
              confirm('Reset ALL progress, notes, saved items, plan and imported packs? This cannot be undone.') &&
              (resetAll(), toast('Everything reset', 'info'))
            }
          >
            <RotateCcw size={16} /> Reset everything
          </button>
        </div>
      </section>

      {/* ── Install as app ── */}
      {!isNative() && (
        <section className="card p-6 flex items-start gap-4" data-reveal>
          <Smartphone className="text-brand2 shrink-0 mt-1" />
          <div className="flex-1">
            <div className="font-semibold">Install it like an app</div>
            <p className="text-sm text-muted mt-1">
              On Android Chrome: menu → "Install app". On iPhone Safari: Share → "Add to Home Screen".
              It works offline after the first load.
            </p>
            {bip && (
              <button className="btn btn-primary btn-sm mt-3" onClick={() => void bip.prompt()}>
                Install now
              </button>
            )}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-faint pt-2" data-reveal>
        {settings.theme === 'dark' ? <Moon size={11} className="inline mr-1" /> : <Sun size={11} className="inline mr-1" />}
        Upgrade Myself v1.0
      </p>
    </div>
  )
}

// ── Account / Cloud-sync card ─────────────────────────────────────────────────

function AccountSection() {
  const { user, loading, signInWithGoogle, signOut, syncing } = useAuth()
  const [manualSyncing, setManualSyncing] = useState(false)

  const handleManualSync = async () => {
    setManualSyncing(true)
    try {
      await pushAll()
      toast('Synced to cloud ☁️', 'good')
    } catch {
      toast('Sync failed — try again', 'bad')
    } finally {
      setManualSyncing(false)
    }
  }

  if (loading) {
    return <section className="card p-6 h-28 shimmer bg-surface" data-reveal />
  }

  if (!user) {
    return (
      <section className="card p-6 space-y-4" data-reveal>
        <div className="flex items-center gap-2">
          <CloudOff size={17} className="text-muted" />
          <div className="eyebrow">Cloud sync — not signed in</div>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Sign in with Google to back up your progress and access it from any device.
          Your local data is always kept — signing in just adds a cloud copy.
        </p>
        <button
          id="settings-google-signin"
          className="btn btn-primary"
          onClick={() => void signInWithGoogle()}
        >
          <GoogleIcon /> Sign in with Google
        </button>
      </section>
    )
  }

  const busy = syncing || manualSyncing

  return (
    <section className="card p-6 space-y-4" data-reveal>
      <div className="flex items-center gap-2">
        <Cloud size={17} className="text-good" />
        <div className="eyebrow">Cloud sync — signed in</div>
      </div>

      {/* Avatar + info row */}
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-brand/40 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full grid place-items-center bg-brand/20 text-brand font-bold text-lg border border-brand/30 shrink-0">
            {(user.name ?? user.email ?? '?')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{user.name ?? 'Google user'}</div>
          <div className="text-xs text-muted truncate">{user.email}</div>
        </div>
        {busy ? (
          <span className="chip chip-accent shrink-0">
            <RefreshCw size={11} className="animate-spin" /> Syncing…
          </span>
        ) : (
          <span
            className="chip shrink-0"
            style={{
              color: 'var(--good)',
              borderColor: 'color-mix(in oklab, var(--good) 35%, transparent)',
              background: 'color-mix(in oklab, var(--good) 10%, transparent)',
            }}
          >
            ☁️ Synced
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <button
          id="settings-sync-now"
          className="btn btn-sm"
          disabled={busy}
          onClick={() => void handleManualSync()}
        >
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Sync now
        </button>
        <button
          id="settings-signout"
          className="btn btn-sm"
          style={{ color: 'var(--bad)' }}
          onClick={() => void signOut()}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </section>
  )
}

// ── Google G icon ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path fill="#EA4335" d="M6.3 14.7l7 5.1C15.2 16.3 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z"/>
      <path fill="#34A853" d="M24 45c5.5 0 10.5-1.9 14.4-5.1l-6.7-5.5C29.6 36.1 26.9 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.2 41.5 15.5 45 24 45z"/>
      <path fill="#4A90D9" d="M44.5 20H24v8.5h11.8c-.6 2.7-2.3 4.9-4.5 6.4l6.7 5.5C41.7 36.8 44.5 31 44.5 24c0-1.3-.2-2.7-.5-4z"/>
      <path fill="#FBBC05" d="M6.3 14.7C4.8 17.3 4 20.3 4 24c0 3.6.8 7 2.3 9.9l7-5.4C12.8 27 12.5 25.5 12.5 24s.3-3 .8-4.4l-7-4.9z"/>
    </svg>
  )
}
