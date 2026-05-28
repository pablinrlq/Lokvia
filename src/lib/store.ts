import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, WorkProfile } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))

// ─── v2.0 — WorkProfile store (persistido em localStorage) ────────────
interface WorkProfileState {
  profile: WorkProfile
  setProfile: (p: WorkProfile) => void
  patchProfile: (partial: Partial<WorkProfile>) => void
  reset: () => void
}

const DEFAULT_PROFILE: WorkProfile = {
  type: 'dev',
  schedule: 'flex',
  priorities: ['fast_wifi', 'silence', 'ergonomics'],
  callsPerDay: 2,
  needsExternalMonitor: false,
}

export const useWorkProfile = create<WorkProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (profile) => set({ profile }),
      patchProfile: (partial) => set({ profile: { ...get().profile, ...partial } }),
      reset: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: 'lokvia.work-profile' },
  ),
)
