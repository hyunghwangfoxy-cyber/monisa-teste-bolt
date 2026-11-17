import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/preferences'

export interface MonisaState {
  user: User | null
  loading: boolean
  profile: Profile | null
  profileLoading: boolean
  error: string
  recoveryRequired: boolean
  finishRecovery: () => void
  refreshProfile: () => Promise<void>
  setProfile: (profile: Profile) => void
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

export const MonisaContext = createContext<MonisaState | null>(null)

export function useMonisa() {
  const context = useContext(MonisaContext)
  if (!context) throw new Error('MonisaProvider is required')
  return context
}
