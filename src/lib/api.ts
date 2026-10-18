import { defaultPreferences } from './preferences'
import type { Profile, ChatMessage } from './preferences'

function readProfile(): Profile | null {
  try {
    const raw = localStorage.getItem('monisa-demo-profile')
    return raw ? JSON.parse(raw) as Profile : null
  } catch { return null }
}
function saveProfile(profile: Profile) {
  localStorage.setItem('monisa-demo-profile', JSON.stringify(profile))
  return profile
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  const profile = readProfile()
  if (path.startsWith('/api/profile')) {
    if (method === 'PUT') {
      const updated = saveProfile(JSON.parse(String(options.body || '{}')) as Profile)
      return updated as T
    }
    if (!profile) throw new Error('Digite seu nome para iniciar a demonstração.')
    return profile as T
  }
  if (path.startsWith('/api/avatar')) {
    if (!profile) throw new Error('Digite seu nome para iniciar a demonstração.')
    let avatarUrl = profile.avatarUrl
    if (method === 'DELETE') avatarUrl = null
    else if (options.body instanceof Blob) {
      avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
        reader.readAsDataURL(options.body as Blob)
      })
    }
    return saveProfile({ ...profile, avatarUrl }) as T
  }
  if (path.startsWith('/api/chat')) {
    const stored = localStorage.getItem('monisa-demo-messages')
    let messages: ChatMessage[] = stored ? JSON.parse(stored) as ChatMessage[] : []
    let conversationId = 1
    if (method === 'POST') {
      const body = JSON.parse(String(options.body || '{}')) as { message?: string; action?: string }
      if (body.message) {
        messages = [...messages, { id: Date.now(), role: 'user', content: body.message }, { id: Date.now() + 1, role: 'assistant', content: 'Estou no modo de demonstração, então a IA e as conversas conectadas ao servidor não estão disponíveis agora. Para sua apresentação, você ainda pode explorar o quiz, os jogos e as opções de acessibilidade.' }]
        localStorage.setItem('monisa-demo-messages', JSON.stringify(messages))
      }
    }
    return { messages, conversations: [{ id: conversationId, title: 'Conversa de demonstração' }], conversationId } as T
  }
  const response = await fetch(path, { ...options, credentials: 'same-origin' })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'Não foi possível concluir. Tente novamente.')
  return data as T
}

export function jsonRequest(method: string, data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}
