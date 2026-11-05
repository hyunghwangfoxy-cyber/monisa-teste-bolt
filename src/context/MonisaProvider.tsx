import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
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

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next)
  }, [])

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
      setError('A conexão com o Supabase ainda não foi configurada. Adicione as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.')
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError('Não foi possível recuperar sua sessão. Entre novamente.')
      const session = data.session
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        try { await refreshProfile() } catch { /* A tela oferece nova tentativa. */ }
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      if (!active) return
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') setRecoveryRequired(true)
      if (!session?.user) {
        setProfileState(null)
        setRecoveryRequired(false)
      }
      setLoading(false)
      if (session?.user) window.setTimeout(() => {
        if (active) refreshProfile().catch(() => undefined)
      }, 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  useEffect(() => {
    applyPreferences(profile?.preferences || defaultPreferences)
  }, [profile])

  return <MonisaContext.Provider value={{
    user, loading, profile, profileLoading, error, recoveryRequired,
    finishRecovery: () => setRecoveryRequired(false),
    refreshProfile, setProfile, signOut,
  }}>{children}</MonisaContext.Provider>
}
