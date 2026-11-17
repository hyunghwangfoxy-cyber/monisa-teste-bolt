export interface Preferences {
  theme: 'dark' | 'light' | 'contrast'
  fontSize: 'normal' | 'large' | 'extra-large'
  reducedMotion: boolean
  simpleLanguage: boolean
  responseStyle: 'short' | 'steps' | 'detailed'
  focusMode: boolean
  breakMinutes: number
  dyslexiaFont: boolean
  letterSpacing: 'normal' | 'wide' | 'wider'
  lineSpacing: 'normal' | 'relaxed' | 'wide'
  readingRuler: boolean
  lowStimulus: boolean
  literalLanguage: boolean
  everydayExamples: boolean
  visualSummaries: boolean
  mathSteps: boolean
  oneInstructionAtTime: boolean
}

export const defaultPreferences: Preferences = {
  theme: 'dark',
  fontSize: 'normal',
  reducedMotion: true,
  simpleLanguage: true,
  responseStyle: 'steps',
  focusMode: false,
  breakMinutes: 25,
  dyslexiaFont: false,
  letterSpacing: 'normal',
  lineSpacing: 'relaxed',
  readingRuler: false,
  lowStimulus: false,
  literalLanguage: false,
  everydayExamples: true,
  visualSummaries: false,
  mathSteps: true,
  oneInstructionAtTime: false,
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
  root.dataset.dyslexiaFont = String(preferences.dyslexiaFont)
  root.dataset.letterSpacing = preferences.letterSpacing
  root.dataset.lineSpacing = preferences.lineSpacing
  root.dataset.readingRuler = String(preferences.readingRuler)
  root.dataset.lowStimulus = String(preferences.lowStimulus)
}
