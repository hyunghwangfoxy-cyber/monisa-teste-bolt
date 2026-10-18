import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { MonisaContext } from './MonisaContext'
import { api } from '../lib/api'
import { applyPreferences, defaultPreferences } from '../lib/preferences'
import type { Profile } from '../lib/preferences'

function readDemoProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('monisa-demo-profile')
    return raw ? JSON.parse(raw) as Profile : null
  } catch { return null }
}

export default function MonisaProvider({ children }: { children: ReactNode }) {
  const [user] = useState<null>(null)
  const [loading, setLoading] = useState(false)
  const [profile, setProfileState] = useState<Profile | null>(() => readDemoProfile())
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState('')
  const [recoveryRequired] = useState(false)

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next)
    localStorage.setItem('monisa-demo-profile', JSON.stringify(next))
  }, [])

  useEffect(() => {
    setLoading(false)
    setProfileLoading(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true)
    setError('')
    try { setProfile(await api<Profile>('/api/profile')) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível carregar seu perfil.') }
    finally { setProfileLoading(false) }
  }, [setProfile])

  useEffect(() => { applyPreferences(profile?.preferences || defaultPreferences) }, [profile])

  return <MonisaContext.Provider value={{ user, loading, profile, profileLoading, error, recoveryRequired, finishRecovery: () => {}, refreshProfile, setProfile }}>{children}</MonisaContext.Provider>
}
