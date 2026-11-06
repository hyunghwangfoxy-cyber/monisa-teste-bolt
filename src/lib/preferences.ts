export interface Preferences {
  theme: 'dark' | 'light' | 'contrast'
  fontSize: 'normal' | 'large' | 'extra-large'
  reducedMotion: boolean
  simpleLanguage: boolean
  responseStyle: 'short' | 'steps' | 'detailed'
  focusMode: boolean
  breakMinutes: number
}

export const defaultPreferences: Preferences = {
  theme: 'dark',
  fontSize: 'normal',
  reducedMotion: true,
  simpleLanguage: true,
  responseStyle: 'steps',
  focusMode: false,
  breakMinutes: 25,
}

export interface Profile {
  name: string
  bio: string
  subject: string
  learningProfile: Record<string, string> | null
  avatarUrl: string | null
  preferences: Preferences
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export function applyPreferences(preferences: Preferences) {
  const root = document.documentElement
  root.dataset.theme = preferences.theme
  root.dataset.fontSize = preferences.fontSize
  root.dataset.reducedMotion = String(preferences.reducedMotion)
  root.dataset.focusMode = String(preferences.focusMode)
}
