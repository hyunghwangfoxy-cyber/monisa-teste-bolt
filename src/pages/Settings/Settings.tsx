import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, Sparkles, Coffee, Check } from 'lucide-react'
import { useMonisa } from '../../context/MonisaContext'
import { api, jsonRequest } from '../../lib/api'
import { applyPreferences, defaultPreferences } from '../../lib/preferences'
import type { Preferences, Profile } from '../../lib/preferences'

export default function Settings() {
  const { profile, setProfile } = useMonisa()
  const initialPreferences = { ...defaultPreferences, ...(profile?.preferences || {}) }
  const [draft, setDraft] = useState<Preferences>(initialPreferences)
  const saved = useRef<Preferences>(initialPreferences)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const changed = JSON.stringify(draft) !== JSON.stringify({ ...defaultPreferences, ...(profile?.preferences || {}) })

  useEffect(() => {
    applyPreferences(draft)
    return () => applyPreferences(saved.current)
  }, [draft])

  function change<Key extends keyof Preferences>(key: Key, value: Preferences[Key]) {
    setDraft(previous => ({ ...previous, [key]: value }))
    setNotice('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await api<Profile>('/api/profile', jsonRequest('PUT', { ...profile, preferences: draft }))
      saved.current = updated.preferences
      setProfile(updated)
      setNotice('Preferências salvas! As próximas respostas da Monisa usam o seu jeito de aprender.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível salvar suas preferências.') }
    finally { setBusy(false) }
  }

  if (!profile) return null
  return <section className="personal-page" aria-labelledby="settings-title">
    <div className="page-heading"><span className="eyebrow">NÃO EXISTE UM JEITO ÚNICO DE APRENDER</span><h1 id="settings-title">Encontre o seu conforto.</h1><p>Escolha o que ajuda você. Estas opções são para todas as pessoas — sem rótulos ou diagnósticos.</p></div>
    <form onSubmit={save} className="settings-form">
      <fieldset className="settings-card" disabled={busy}><legend><Eye size={20} />Conforto visual</legend>
        <div className="settings-fields"><label><span id="theme-label">Tema</span><select aria-labelledby="theme-label" value={draft.theme} onChange={event => change('theme', event.target.value as Preferences['theme'])}><option value="dark">Escuro — azul tranquilo</option><option value="light">Claro — luz suave</option><option value="contrast">Alto contraste</option></select></label><label><span id="font-label">Tamanho do texto</span><select aria-labelledby="font-label" value={draft.fontSize} onChange={event => change('fontSize', event.target.value as Preferences['fontSize'])}><option value="normal">Normal</option><option value="large">Grande</option><option value="extra-large">Muito grande</option></select></label></div>
        <label className="toggle-row"><span><strong>Reduzir movimentos</strong><span>Sem animações e sem rolagem animada.</span></span><input type="checkbox" checked={draft.reducedMotion} onChange={event => change('reducedMotion', event.target.checked)} /></label>
        <div className="reading-preview"><span className="eyebrow">EXPERIMENTE O CONFORTO</span><p>Você pode ir no seu ritmo. Um pequeno passo já é um começo.</p></div>
      </fieldset>
      <fieldset className="settings-card" disabled={busy}><legend><Sparkles size={20} />Como a Monisa explica</legend>
        <label><span id="response-label">Formato das respostas</span><select aria-labelledby="response-label" value={draft.responseStyle} onChange={event => change('responseStyle', event.target.value as Preferences['responseStyle'])}><option value="short">Curtas — direto ao ponto</option><option value="steps">Passo a passo — uma ideia por vez</option><option value="detailed">Detalhadas — exemplos e explicações</option></select></label>
        <label className="toggle-row"><span><strong>Linguagem simples</strong><span>Palavras claras, termos explicados e exemplos concretos.</span></span><input type="checkbox" checked={draft.simpleLanguage} onChange={event => change('simpleLanguage', event.target.checked)} /></label>
        <p className="field-hint">A preferência vale para novas respostas. Você também pode pedir “explique de outro jeito” durante a conversa.</p>
      </fieldset>
      <fieldset className="settings-card" disabled={busy}><legend><Coffee size={20} />Foco e pausas</legend>
        <label className="toggle-row"><span><strong>Modo foco</strong><span>Oculta detalhes decorativos e orienta a IA a tratar uma tarefa por vez.</span></span><input type="checkbox" checked={draft.focusMode} onChange={event => change('focusMode', event.target.checked)} /></label>
        <label><span id="break-label">Lembrar de fazer uma pausa</span><select aria-labelledby="break-label" aria-describedby="break-description" value={draft.breakMinutes} onChange={event => change('breakMinutes', Number(event.target.value))}><option value={0}>Sem lembretes</option><option value={15}>A cada 15 minutos</option><option value={25}>A cada 25 minutos</option><option value={45}>A cada 45 minutos</option></select><span id="break-description" className="field-hint">Lembrete silencioso durante o chat. Você pode pausar o relógio e decidir quando continuar.</span></label>
      </fieldset>
      <fieldset className="settings-card" disabled={busy}><legend><Eye size={20} />Leitura e dislexia</legend>
        <label className="toggle-row"><span><strong>Fonte alternativa para leitura</strong><span>Usa uma fonte mais simples como opção de leitura.</span></span><input type="checkbox" checked={draft.dyslexiaFont} onChange={event => change('dyslexiaFont', event.target.checked)} /></label>
        <div className="settings-fields"><label><span id="letter-spacing-label">Espaçamento entre letras</span><select aria-labelledby="letter-spacing-label" value={draft.letterSpacing} onChange={event => change('letterSpacing', event.target.value as Preferences['letterSpacing'])}><option value="normal">Padrão</option><option value="wide">Amplo</option><option value="wider">Bem amplo</option></select></label><label><span id="line-spacing-label">Espaçamento entre linhas</span><select aria-labelledby="line-spacing-label" value={draft.lineSpacing} onChange={event => change('lineSpacing', event.target.value as Preferences['lineSpacing'])}><option value="normal">Padrão</option><option value="relaxed">Confortável</option><option value="wide">Bem espaçado</option></select></label></div>
        <label className="toggle-row"><span><strong>Régua de leitura</strong><span>Uma faixa discreta ajuda a acompanhar a linha do texto.</span></span><input type="checkbox" checked={draft.readingRuler} onChange={event => change('readingRuler', event.target.checked)} /></label>
      </fieldset>
      <fieldset className="settings-card" disabled={busy}><legend><Sparkles size={20} />Estímulos e concentração</legend>
        <label className="toggle-row"><span><strong>Interface com menos estímulos</strong><span>Reduz efeitos visuais e sombras.</span></span><input type="checkbox" checked={draft.lowStimulus} onChange={event => change('lowStimulus', event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Uma instrução por vez</strong><span>A Monisa evita enviar muitas orientações na mesma resposta.</span></span><input type="checkbox" checked={draft.oneInstructionAtTime} onChange={event => change('oneInstructionAtTime', event.target.checked)} /></label>
      </fieldset>
      <fieldset className="settings-card" disabled={busy}><legend><Sparkles size={20} />Compreensão e comunicação</legend>
        <label className="toggle-row"><span><strong>Linguagem literal</strong><span>Evita expressões figuradas, ironias e ambiguidades quando possível.</span></span><input type="checkbox" checked={draft.literalLanguage} onChange={event => change('literalLanguage', event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Exemplos do cotidiano</strong><span>Relaciona conceitos com situações práticas.</span></span><input type="checkbox" checked={draft.everydayExamples} onChange={event => change('everydayExamples', event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Resumos e esquemas visuais</strong><span>Quando fizer sentido, organiza a explicação em quadros, tabelas ou esquemas.</span></span><input type="checkbox" checked={draft.visualSummaries} onChange={event => change('visualSummaries', event.target.checked)} /></label>
        <label className="toggle-row"><span><strong>Matemática passo a passo</strong><span>Mostra o raciocínio e explica os símbolos usados.</span></span><input type="checkbox" checked={draft.mathSteps} onChange={event => change('mathSteps', event.target.checked)} /></label>
      </fieldset>
      <div className="save-preferences"><div><strong>{changed ? 'Alterações ainda não salvas' : 'Tudo do seu jeito'}</strong><p>O visual é uma prévia. Salve para manter suas escolhas na conta.</p></div><div className="button-row">{changed && <button className="secondary-button" type="button" disabled={busy} onClick={() => { setDraft({ ...defaultPreferences, ...(profile.preferences || {}) }); setError(''); setNotice('') }}>Descartar alterações</button>}<button className="primary-button" type="submit" disabled={busy || !changed}><Check size={18} />{busy ? 'Salvando…' : 'Salvar preferências'}</button></div></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="form-success" role="status">{notice}</p>}
    </form>
  </section>
}
