import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { MonisaContext } from './MonisaContext'
import { api } from '../lib/api'
import { applyPreferences, defaultPreferences } from '../lib/preferences'
import type { Profile } from '../lib/preferences'
import { supabase, supabaseConfigured } from '../lib/supabase'

export default function MonisaProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState('')
  const [recoveryRequired, setRecoveryRequired] = useState(false)

  const setProfile = useCallback((next: Profile) => setProfileState(next), [])

  const refreshProfile = useCallback(async () => {
    if (!supabaseConfigured) {
      setError('A conexão com o banco ainda não foi configurada na Vercel.')
      return
    }
    setProfileLoading(true)
    setError('')
    try {
      setProfile(await api<Profile>('/api/profile'))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível carregar seu perfil.')
      throw failure
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError
    setProfileState(null)
    setUser(null)
    setRecoveryRequired(false)
  }, [])

  useEffect(() => {
    let active = true
    if (!supabaseConfigured) {
      setError('A conexão com o Supabase ainda não foi configurada. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.')
      setLoading(false)
      return
    }

    const initialize = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return
      if (sessionError) setError('Não foi possível recuperar sua sessão. Entre novamente.')
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        setProfileLoading(true)
        try { setProfile(await api<Profile>('/api/profile')) }
        catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível carregar seu perfil.') }
        finally { if (active) setProfileLoading(false) }
      }
      if (active) setLoading(false)
    }
    void initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event === 'INITIAL_SESSION') return
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (event === 'PASSWORD_RECOVERY') setRecoveryRequired(true)
      if (!nextUser) {
        setProfileState(null)
        setRecoveryRequired(false)
        return
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        window.setTimeout(() => {
          if (active) void refreshProfile().catch(() => undefined)
        }, 0)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  useEffect(() => { applyPreferences(profile?.preferences || defaultPreferences) }, [profile])

  return <MonisaContext.Provider value={{
    user, loading, profile, profileLoading, error, recoveryRequired,
    finishRecovery: () => setRecoveryRequired(false),
    refreshProfile, setProfile, signOut,
  }}>{children}</MonisaContext.Provider>
}
