import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjixonhjbfafgpgsxmzw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_eJxTaVm1aR5TIRKUA1VNzQ_U1P6rSW_'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type SupaUser = {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
}

export function toSupaUser(user: import('@supabase/supabase-js').User | null): SupaUser | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar: user.user_metadata?.avatar_url ?? null,
  }
}
