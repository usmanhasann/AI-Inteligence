/**
 * AuthContext — wraps the app, exposes current user + sign-in / sign-out helpers.
 * Listens to Supabase onAuthStateChange and drives sync on login/logout.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, toSupaUser, type SupaUser } from '../lib/supabase.ts'
import { pullAll, pushAll } from '../lib/sync.ts'
import { toast } from '../lib/store.ts'

interface AuthCtx {
  user: SupaUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  syncing: boolean
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  syncing: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupaUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    // Hydrate current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(toSupaUser(data.session?.user ?? null))
      setLoading(false)
    })

    // Listen for future auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = toSupaUser(session?.user ?? null)
      setUser(newUser)
      setLoading(false)

      if (_event === 'SIGNED_IN' && newUser) {
        setSyncing(true)
        // Pull cloud data first, then push local additions on top
        pullAll()
          .then(() => pushAll())
          .then(() => toast('Synced with cloud ☁️', 'good'))
          .catch(() => toast('Sync failed — data is still saved locally', 'bad'))
          .finally(() => setSyncing(false))
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) toast('Could not open Google sign-in: ' + error.message, 'bad')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast('Signed out', 'info')
  }

  return <Ctx.Provider value={{ user, loading, signInWithGoogle, signOut, syncing }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
