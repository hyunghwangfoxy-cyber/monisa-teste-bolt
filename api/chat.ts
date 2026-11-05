import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

type RequestLike = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}
type ResponseLike = {
  status(code: number): ResponseLike
  json(value: unknown): void
  setHeader(name: string, value: string): void
}

function fail(res: ResponseLike, status: number, error: string) {
  res.status(status).json({ error })
}

function bodyObject(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    try { return JSON.parse(body) as Record<string, unknown> } catch { return {} }
  }
  return body && typeof body === 'object' ? body as Record<string, unknown> : {}
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (!['GET', 'POST', 'DELETE'].includes(req.method || '')) return fail(res, 405, 'Método não permitido.')

  const authorization = req.headers.authorization
  const bearer = Array.isArray(authorization) ? authorization[0] : authorization
  const token = bearer?.match(/^Bearer\s+(.+)$/i)?.[1]
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return fail(res, 503, 'A conexão com o Supabase não está configurada no servidor.')
  if (!token) return fail(res, 401, 'Entre na sua conta para continuar.')

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: auth, error: authError } = await supabase.auth.getUser(token)
  if (authError || !auth.user) return fail(res, 401, 'Sua sessão expirou. Entre novamente.')
  const userId = auth.user.id

  const { data: profile } = await supabase.from('profiles').select('name,subject,preferences,learning_profile').eq('id', userId).maybeSingle()
  const preferences = profile?.preferences || {}
  const responseStyle = preferences.responseStyle || 'steps'
  const style = responseStyle === 'short'
    ? 'Responda de forma concisa, mas completa.'
    : responseStyle === 'detailed'
      ? 'Explique com detalhes, subtítulos curtos e exemplos concretos.'
      : 'Explique em pequenos passos, uma ideia por vez.'
  const learningContext = profile?.learning_profile
    ? `Perfil de aprendizagem informado pelo estudante: ${JSON.stringify(profile.learning_profile).slice(0, 1600)}. Use isso apenas para adaptar a forma de explicar; não faça diagnósticos.`
    : ''
  const instructions = `Você é Monisa, uma assistente de IA completa e também tutora educacional. Converse naturalmente sobre assuntos variados, respeitando limites de segurança. Quando a pessoa estiver estudando, ensine com clareza, exemplos, analogias e exercícios graduais. Responda em português do Brasil, sem infantilizar. Nome da estudante: ${profile?.name || 'Estudante'}. Matéria de interesse: ${profile?.subject || 'não informada'}. ${learningContext} ${style} ${preferences.simpleLanguage ? 'Prefira linguagem simples e explique termos técnicos.' : ''} ${preferences.focusMode ? 'Mantenha foco em uma ideia por vez e evite excesso de informações.' : ''} Se não souber algo, deixe isso claro e não invente fontes. Não faça diagnósticos médicos ou psicológicos.`

  const conversationId = Number(req.query?.conversationId)
  if (req.method === 'GET') {
    const { data: existing } = await supabase.from('study_conversations').select('id,title,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(30)
    let conversations = existing || []
    if (!conversations.length) {
      const { data: created, error } = await supabase.from('study_conversations').insert({ user_id: userId, title: 'Primeira conversa' }).select('id,title,updated_at').single()
      if (error || !created) return fail(res, 503, 'Não foi possível criar sua primeira conversa.')
      conversations = [created]
    }
    const selected = conversations.find(item => item.id === conversationId) || conversations[0]
    const { data: messages, error } = await supabase.from('study_messages').select('id,role,content').eq('user_id', userId).eq('conversation_id', selected.id).order('id', { ascending: true }).limit(40)
    if (error) return fail(res, 503, 'Não foi possível carregar as mensagens.')
    return res.status(200).json({ conversations, conversationId: selected.id, messages: messages || [] })
  }

  if (req.method === 'DELETE') {
    if (!Number.isInteger(conversationId) || conversationId < 1) return fail(res, 400, 'Escolha a conversa que deseja apagar.')
    const { error } = await supabase.from('study_conversations').delete().eq('id', conversationId).eq('user_id', userId)
    if (error) return fail(res, 503, 'Não foi possível apagar esta conversa.')
    const { data: remaining } = await supabase.from('study_conversations').select('id,title,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(30)
    let conversations = remaining || []
    if (!conversations.length) {
      const { data: created, error: createError } = await supabase.from('study_conversations').insert({ user_id: userId, title: 'Nova conversa' }).select('id,title,updated_at').single()
      if (createError || !created) return fail(res, 503, 'Conversa apagada, mas não foi possível criar uma nova.')
      conversations = [created]
    }
    return res.status(200).json({ conversations, conversationId: conversations[0].id, messages: [] })
  }

  const body = bodyObject(req.body)
  if (body.action === 'create') {
    const { data: created, error } = await supabase.from('study_conversations').insert({ user_id: userId, title: 'Nova conversa' }).select('id,title,updated_at').single()
    if (error || !created) return fail(res, 503, 'Não foi possível criar uma conversa.')
    const { data: conversations } = await supabase.from('study_conversations').select('id,title,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(30)
    return res.status(200).json({ conversations: conversations || [created], conversationId: created.id, messages: [] })
  }

  if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2000) return fail(res, 400, 'Escreva uma pergunta com até 2.000 caracteres.')
  if (!process.env.OPENAI_API_KEY) return fail(res, 503, 'A IA ainda não foi ativada. Adicione OPENAI_API_KEY nas variáveis de ambiente da Vercel.')

  let targetId = Number(body.conversationId)
  let title = body.message.trim().slice(0, 54)
  if (Number.isInteger(targetId) && targetId > 0) {
    const { data: target } = await supabase.from('study_conversations').select('id,title').eq('id', targetId).eq('user_id', userId).maybeSingle()
    if (!target) return fail(res, 404, 'Esta conversa não foi encontrada. Atualize a página e tente novamente.')
    title = target.title
  } else {
    const { data: created, error } = await supabase.from('study_conversations').insert({ user_id: userId, title }).select('id,title').single()
    if (error || !created) return fail(res, 503, 'Não foi possível iniciar uma conversa.')
    targetId = created.id
  }

  const { data: history, error: historyError } = await supabase.from('study_messages').select('role,content').eq('user_id', userId).eq('conversation_id', targetId).order('id', { ascending: false }).limit(20)
  if (historyError) return fail(res, 503, 'Não foi possível recuperar o contexto da conversa.')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 1 })
  let answer = ''
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      max_completion_tokens: 1400,
      messages: [
        { role: 'system', content: instructions },
        ...(history || []).reverse().map(message => ({ role: message.role as 'user' | 'assistant', content: message.content })),
        { role: 'user', content: body.message.trim() },
      ],
    })
    answer = completion.choices[0]?.message.content?.trim() || ''
  } catch {
    return fail(res, 503, 'A Monisa não conseguiu responder agora. Tente novamente em instantes.')
  }
  if (!answer) return fail(res, 503, 'A Monisa não recebeu uma resposta válida. Tente novamente.')

  const { data: saved, error: saveError } = await supabase.from('study_messages').insert([
    { user_id: userId, conversation_id: targetId, role: 'user', content: body.message.trim() },
    { user_id: userId, conversation_id: targetId, role: 'assistant', content: answer },
  ]).select('id,role,content')
  if (saveError || !saved) return fail(res, 503, 'A resposta foi gerada, mas não foi possível salvá-la. Tente novamente.')
  await supabase.from('study_conversations').update({ title: history?.length ? title : body.message.trim().slice(0, 54), updated_at: new Date().toISOString() }).eq('id', targetId).eq('user_id', userId)
  const { data: conversations } = await supabase.from('study_conversations').select('id,title,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(30)
  return res.status(200).json({ conversations: conversations || [], conversationId: targetId, messages: saved })
}
