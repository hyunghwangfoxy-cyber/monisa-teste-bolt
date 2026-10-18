import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, Send, Sparkles, MessageCircle, FileText, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMonisa } from '../../context/MonisaContext'
import { api, jsonRequest } from '../../lib/api'
import type { ChatMessage } from '../../lib/preferences'
import BreakTimer from '../BreakTimer'

type Conversation = { id: number; title: string; updatedAt?: string }
type ChatResponse = { messages: ChatMessage[]; conversations: Conversation[]; conversationId: number }

export default function AIChat() {
  const { profile } = useMonisa()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [retry, setRetry] = useState(0)
  const end = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const pending = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    const query = conversationId ? '?conversationId=' + conversationId : ''
    api<ChatResponse>('/api/chat' + query, { signal: controller.signal }).then(data => {
      setConversations(data.conversations || [])
      setConversationId(data.conversationId)
      setMessages(data.messages || [])
      setError('')
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Não foi possível carregar a conversa.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry])

  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ behavior: profile?.preferences.reducedMotion ? 'instant' : 'smooth', block: 'nearest' })
  }, [messages, profile?.preferences.reducedMotion])

  async function openConversation(id: number) {
    if (pending.current || id === conversationId) return
    setLoading(true); setError(''); setConversationId(id); setDraft(''); setConfirmDelete(false)
    try {
      const data = await api<ChatResponse>('/api/chat?conversationId=' + id)
      setConversations(data.conversations || [])
      setConversationId(data.conversationId)
      setMessages(data.messages || [])
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível abrir esta conversa.') }
    finally { setLoading(false) }
  }

  async function newConversation() {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      const data = await api<ChatResponse>('/api/chat', jsonRequest('POST', { action: 'create' }))
      setConversations(data.conversations || [])
      setConversationId(data.conversationId)
      setMessages([])
      setDraft('')
      setConfirmDelete(false)
      input.current?.focus()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível criar uma conversa.') }
    finally { pending.current = false; setBusy(false) }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim() || pending.current || loading) return
    pending.current = true; setBusy(true); setError('')
    try {
      const result = await api<ChatResponse>('/api/chat', jsonRequest('POST', { message: draft.trim(), conversationId }))
      setMessages(previous => [...previous, ...result.messages])
      setConversations(result.conversations || [])
      setConversationId(result.conversationId)
      setDraft('')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível enviar sua pergunta.') }
    finally { pending.current = false; setBusy(false); input.current?.focus() }
  }

  async function deleteConversation() {
    if (!conversationId || pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      const result = await api<ChatResponse>('/api/chat?conversationId=' + conversationId, { method: 'DELETE' })
      setConversations(result.conversations || [])
      setConversationId(result.conversationId)
      setMessages(result.messages || [])
      setConfirmDelete(false)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível apagar a conversa.') }
    finally { pending.current = false; setBusy(false) }
  }

  function suggest(text: string) { setDraft(text); input.current?.focus() }
  const loadAgain = useCallback(() => { setLoading(true); setRetry(value => value + 1) }, [])
  if (!profile) return null

  return <section className="chat-page" aria-labelledby="chat-title">
    <div className="chat-heading"><div><span className="eyebrow">UM ESPAÇO PARA DESCOBRIR</span><h1 id="chat-title">Olá, {profile.name.split(' ')[0]}.<br /><span>O que vamos aprender hoje?</span></h1><p className="optional-detail">Eu sou a Monisa. A gente pode ir devagar, repetir e encontrar outro jeito de explicar.</p></div><span className="tutor-symbol optional-detail" aria-hidden="true"><Sparkles size={34} /></span></div>
    <div className="chat-tools"><Link className="preference-chip" to="/settings"><span className="status-dot" />Explicações {profile.preferences.responseStyle === 'steps' ? 'passo a passo' : profile.preferences.responseStyle === 'short' ? 'curtas' : 'detalhadas'}</Link><BreakTimer key={profile.preferences.breakMinutes} minutes={profile.preferences.breakMinutes} /></div>
    <section className="chat-history" aria-label="Conversas salvas">
      <div className="chat-history-heading"><div><strong>Suas conversas</strong><span>Seus assuntos ficam separados.</span></div><button className="primary-button" type="button" onClick={newConversation} disabled={busy}><Plus size={17} /> Nova conversa</button></div>
      <div className="chat-history-list">
        {conversations.map(item => <button type="button" key={item.id} className={'chat-history-item' + (item.id === conversationId ? ' active' : '')} onClick={() => openConversation(item.id)} aria-current={item.id === conversationId ? 'page' : undefined}><MessageCircle size={16} /><span>{item.title || 'Nova conversa'}</span></button>)}
      </div>
    </section>
    {messages.length === 0 && !loading && <div className="chat-suggestions optional-detail">
      <button onClick={() => suggest(`Quero estudar ${profile.subject || 'um novo assunto'}. Você pode me ajudar a começar com uma explicação simples?`)}><BookOpen size={22} /><strong>Começar um estudo</strong><span>Um assunto, pequenos passos.</span></button>
      <button onClick={() => suggest('Quero criar um resumo para estudar. Pergunte qual assunto ou texto eu quero resumir.')}><FileText size={22} /><strong>Criar um resumo</strong><span>Organizar o que mais importa.</span></button>
      <button onClick={() => suggest('Quero praticar com perguntas curtas sobre um assunto que estou estudando. Pergunte qual assunto.')}><Sparkles size={22} /><strong>Praticar um assunto</strong><span>Treinar sem pressa.</span></button>
    </div>}
    <section className="conversation" aria-label="Sua conversa com a Monisa" aria-busy={busy || loading}>
      {loading && <div className="message-skeleton" role="status">Carregando sua conversa…</div>}
      {!loading && messages.length === 0 && <div className="chat-empty"><span className="assistant-label"><Sparkles size={17} />MONISA</span><p>Me conte o que você quer aprender. Você pode escrever uma pergunta ou escolher uma sugestão acima.</p></div>}
      {messages.map(message => <article key={message.id} className={`chat-message ${message.role}`}><span className="assistant-label">{message.role === 'assistant' ? <><Sparkles size={15} />MONISA</> : 'VOCÊ'}</span><p>{message.content}</p></article>)}
      {busy && !confirmDelete && <div className="thinking-message" role="status"><span className="status-dot" />A Monisa está preparando uma explicação para você…</div>}
      <div ref={end} />
    </section>
    {error && <div className="form-error" role="alert">{error}<button className="text-button" disabled={busy} onClick={loadAgain}>Recarregar conversa</button></div>}
    <form className="chat-compose" onSubmit={send}>
      <label htmlFor="study-question" className="visually-hidden">Sua pergunta para a Monisa</label>
      <textarea id="study-question" ref={input} value={draft} readOnly={busy} onChange={event => setDraft(event.target.value)} maxLength={2000} rows={3} placeholder="Escreva sua pergunta. Pode ser do seu jeito…" required />
      <div className="compose-bottom"><span>{draft.length}/2000</span><button className="primary-button" type="submit" disabled={busy || loading || !draft.trim()}>{busy ? 'Aguarde…' : 'Enviar pergunta'}<Send size={17} aria-hidden="true" /></button></div>
    </form>
    <div className="chat-footer"><p>A IA pode errar. Confira informações importantes. Suas mensagens são salvas na sua conta e enviadas ao serviço de IA para gerar respostas.</p>{messages.length > 0 && <button className="text-button" disabled={busy} onClick={() => setConfirmDelete(true)}><Trash2 size={14} />Apagar esta conversa</button>}</div>
    {confirmDelete && <div className="confirm-panel"><p>Apagar esta conversa e suas mensagens? As outras conversas continuarão salvas.</p><div className="button-row"><button className="danger-button" disabled={busy} onClick={deleteConversation}>Sim, apagar conversa</button><button className="secondary-button" disabled={busy} onClick={() => setConfirmDelete(false)}>Cancelar</button></div></div>}
  </section>
}
