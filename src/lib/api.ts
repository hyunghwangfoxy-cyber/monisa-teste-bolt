import type { Profile, ChatMessage } from './preferences'
import { defaultPreferences } from './preferences'
import { supabase } from './supabase'

type ProfileRow = {
  id: string
  name: string
  bio: string
  subject: string
  avatar_url: string | null
  preferences: Profile['preferences']
  learning_profile: Record<string, string> | null
}

function fromRow(row: ProfileRow): Profile {
  return {
    name: row.name,
    bio: row.bio || '',
    subject: row.subject || '',
    avatarUrl: row.avatar_url,
    preferences: row.preferences || defaultPreferences,
    learningProfile: row.learning_profile,
  }
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Sua sessão expirou. Entre novamente.')
  return data.user.id
}

async function getProfile(): Promise<Profile> {
  const id = await currentUserId()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error('Não foi possível carregar seu perfil. Verifique se a tabela profiles foi criada no Supabase.')
  if (data) return fromRow(data as ProfileRow)

  const { data: authData } = await supabase.auth.getUser()
  const newProfile = {
    id,
    name: String(authData.user?.user_metadata?.full_name || authData.user?.email?.split('@')[0] || 'Estudante').slice(0, 80),
    bio: '',
    subject: '',
    preferences: defaultPreferences,
    learning_profile: null,
  }
  const { data: inserted, error: insertError } = await supabase.from('profiles').insert(newProfile).select('*').single()
  if (insertError || !inserted) throw new Error('Não foi possível criar seu perfil. Confira a configuração da tabela no Supabase.')
  return fromRow(inserted as ProfileRow)
}

async function saveProfile(profile: Profile): Promise<Profile> {
  const id = await currentUserId()
  const payload = {
    id,
    name: profile.name.trim().slice(0, 80) || 'Estudante',
    bio: (profile.bio || '').slice(0, 300),
    subject: (profile.subject || '').slice(0, 80),
    avatar_url: profile.avatarUrl,
    preferences: profile.preferences || defaultPreferences,
    learning_profile: profile.learningProfile,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single()
  if (error || !data) throw new Error('Não foi possível salvar seu perfil. Tente novamente.')
  return fromRow(data as ProfileRow)
}

function readDemoMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem('monisa-demo-messages')
    return stored ? JSON.parse(stored) as ChatMessage[] : []
  } catch { return [] }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()

  if (path.startsWith('/api/profile')) {
    const result = method === 'PUT'
      ? await saveProfile(JSON.parse(String(options.body || '{}')) as Profile)
      : await getProfile()
    return result as T
  }

  if (path.startsWith('/api/avatar')) {
    const profile = await getProfile()
    let avatarUrl = profile.avatarUrl
    if (method === 'DELETE') avatarUrl = null
    else if (options.body instanceof Blob) {
      if (options.body.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter até 2 MB.')
      avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
        reader.readAsDataURL(options.body as Blob)
      })
    }
    return await saveProfile({ ...profile, avatarUrl }) as T
  }

  if (path.startsWith('/api/chat') || path.startsWith('/api/discover')) {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    const headers = new Headers(options.headers)
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    const response = await fetch(path, { ...options, headers, credentials: 'same-origin' })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || 'Não foi possível concluir. Tente novamente.')
    return data as T
  }

  const response = await fetch(path, { ...options, credentials: 'same-origin' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'Não foi possível concluir. Tente novamente.')
  return data as T
}

export function jsonRequest(method: string, data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}
