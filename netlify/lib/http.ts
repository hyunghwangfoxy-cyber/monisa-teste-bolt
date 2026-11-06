import { getUser } from '@netlify/identity'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../../db/index.js'
import { profiles } from '../../db/schema.js'
import { defaultPreferences } from '../../src/lib/preferences.js'
import type { Preferences } from '../../src/lib/preferences.js'

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function authenticated(request: Request, handler: (user: NonNullable<Awaited<ReturnType<typeof getUser>>>) => Promise<Response>) {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      const origin = request.headers.get('origin')
      if (!origin || origin !== new URL(request.url).origin) throw new HttpError(403, 'Origem da solicitação inválida.')
    }
    const user = await getUser()
    if (!user) throw new HttpError(401, 'Entre na sua conta para continuar.')
    return await handler(user)
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status)
    return json({ error: 'Não foi possível concluir agora. Tente novamente em instantes.' }, 503)
  }
}

export async function readJson(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415, 'Envie dados em formato JSON.')
  const text = await request.text()
  if (text.length > 12000) throw new HttpError(413, 'A solicitação é muito grande.')
  try {
    const value: unknown = JSON.parse(text)
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
    return value as Record<string, unknown>
  } catch {
    throw new HttpError(400, 'Os dados enviados são inválidos.')
  }
}

export function validatePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Preferências inválidas.')
  const input = value as Record<string, unknown>
  if (!['dark', 'light', 'contrast'].includes(String(input.theme)) ||
      !['normal', 'large', 'extra-large'].includes(String(input.fontSize)) ||
      !['short', 'steps', 'detailed'].includes(String(input.responseStyle)) ||
      ![0, 15, 25, 45].includes(Number(input.breakMinutes)) || typeof input.breakMinutes !== 'number' ||
      ['reducedMotion', 'simpleLanguage', 'focusMode'].some(key => typeof input[key] !== 'boolean')) {
    throw new HttpError(400, 'Escolha opções válidas de acessibilidade.')
  }
  return {
    theme: input.theme as Preferences['theme'],
    fontSize: input.fontSize as Preferences['fontSize'],
    responseStyle: input.responseStyle as Preferences['responseStyle'],
    reducedMotion: input.reducedMotion as boolean,
    simpleLanguage: input.simpleLanguage as boolean,
    focusMode: input.focusMode as boolean,
    breakMinutes: input.breakMinutes,
  }
}

export async function ensureProfile(user: { id: string; name?: string | null }) {
  const db = getDatabase()
  await db.insert(profiles).values({ userId: user.id, name: user.name?.slice(0, 80) || 'Estudante', preferences: defaultPreferences }).onConflictDoNothing()
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id))
  return profile
}

export function publicProfile(profile: typeof profiles.$inferSelect) {
  return {
    name: profile.name,
    bio: profile.bio,
    subject: profile.subject,
    preferences: profile.preferences,
    learningProfile: profile.learningProfile,
    avatarUrl: profile.avatarKey ? `/api/avatar?v=${encodeURIComponent(profile.avatarKey)}` : null,
  }
}
