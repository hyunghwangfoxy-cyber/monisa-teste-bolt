import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useMonisa } from '../../context/MonisaContext'
import { api, jsonRequest } from '../../lib/api'
import type { Profile } from '../../lib/preferences'
import './Quiz.css'

const questions = [
  { id: 'format', title: 'Como fica mais fácil aprender algo novo?', help: 'Não existe resposta certa. Escolha o que costuma ajudar você.', options: [{ label: 'Lendo', value: 'reading', detail: 'Textos curtos e organizados' }, { label: 'Vendo', value: 'visual', detail: 'Imagens, esquemas e exemplos' }, { label: 'Ouvindo', value: 'audio', detail: 'Explicações em linguagem natural' }, { label: 'Praticando', value: 'practice', detail: 'Atividades e pequenos desafios' }] },
  { id: 'pace', title: 'Qual ritmo combina com você?', help: 'Você pode mudar isso quando quiser.', options: [{ label: 'Um passo por vez', value: 'slow', detail: 'Etapas pequenas e sem pressa' }, { label: 'Um ritmo equilibrado', value: 'steady', detail: 'Explicação e prática' }, { label: 'Ir direto ao ponto', value: 'fast', detail: 'Resumo e depois aprofundamento' }] },
  { id: 'reading', title: 'Como você prefere organizar as explicações?', help: 'Vamos ajustar a forma de apresentar o conteúdo.', options: [{ label: 'Passo a passo', value: 'steps' }, { label: 'Resumos curtos', value: 'short' }, { label: 'Detalhes e exemplos', value: 'detailed' }] },
  { id: 'environment', title: 'Qual ambiente visual é mais confortável?', help: 'Escolha o que fica melhor para seus olhos.', options: [{ label: 'Escuro e tranquilo', value: 'dark' }, { label: 'Claro e leve', value: 'light' }, { label: 'Alto contraste', value: 'contrast' }] },
  { id: 'text', title: 'Qual tamanho de texto fica mais confortável?', help: 'A leitura deve se adaptar a você.', options: [{ label: 'Padrão', value: 'normal' }, { label: 'Um pouco maior', value: 'large' }, { label: 'Bem grande', value: 'extra-large' }] },
  { id: 'focus', title: 'O que ajuda você a manter o foco?', help: 'Você pode escolher mais de uma coisa no seu perfil depois.', options: [{ label: 'Uma tarefa por vez', value: 'focus' }, { label: 'Pausas entre atividades', value: 'breaks' }, { label: 'Aprender com jogos', value: 'games' }, { label: 'Poder escolher conforme o dia', value: 'flexible' }] },
  { id: 'subject', title: 'O que você quer estudar primeiro?', help: 'A Monisa pode ajudar em outras matérias também.', options: [{ label: 'Matemática', value: 'Matemática' }, { label: 'Português', value: 'Português' }, { label: 'Inglês', value: 'Inglês' }, { label: 'Ciências', value: 'Ciências' }, { label: 'Programação', value: 'Programação' }, { label: 'Outro assunto', value: 'Outro assunto' }] }
]

export default function Quiz() {
  const navigate = useNavigate()
  const { profile, setProfile } = useMonisa()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(() => profile?.learningProfile || {})
  const [error, setError] = useState('')
  const question = questions[step]
  const progress = useMemo(() => Math.round(((step + 1) / questions.length) * 100), [step])
  const selected = answers[question.id] || ''

  async function finish() {
    const result = { ...answers, completedAt: new Date().toISOString() }
    if (profile) {
      const updated = await api<Profile>('/api/profile', jsonRequest('PUT', {
        ...profile,
        learningProfile: result,
        subject: answers.subject || profile.subject,
        preferences: {
          ...profile.preferences,
          theme: (answers.environment || profile.preferences.theme) as Profile['preferences']['theme'],
          fontSize: (answers.text || profile.preferences.fontSize) as Profile['preferences']['fontSize'],
          responseStyle: (answers.reading || profile.preferences.responseStyle) as Profile['preferences']['responseStyle'],
          focusMode: answers.focus === 'focus',
        },
      }))
      setProfile(updated)
    }
    localStorage.setItem('monisa-learning-profile', JSON.stringify(result))
    localStorage.setItem('monisa-quiz-complete', 'true')
    navigate('/home', { replace: true })
  }

  async function next() {
    if (!selected) { setError('Escolha uma opção para continuar. Você pode alterar essa resposta depois.'); return }
    setError('')
    if (step < questions.length - 1) setStep(value => value + 1)
    else { try { await finish() } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível salvar suas preferências. Tente novamente.') } }
  }

  return <main className="quiz-page">
    <section className="quiz-card" aria-labelledby="quiz-title">
      <div className="quiz-topline"><span className="quiz-brand"><Sparkles size={20} /> MONISA</span><span className="quiz-count">ETAPA {step + 1} DE {questions.length}</span></div>
      <div className="quiz-progress" role="progressbar" aria-label="Progresso do questionário" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: progress + '%' }} /></div>
      <p className="quiz-eyebrow">APRENDER DO SEU JEITO</p>
      <h1 id="quiz-title">{question.title}</h1><p className="quiz-help">{question.help}</p>
      <div className="quiz-options" role="group" aria-label={question.title}>
        {question.options.map(option => <button type="button" key={option.value} className={'quiz-option' + (selected === option.value ? ' is-selected' : '')} aria-pressed={selected === option.value} onClick={() => { setAnswers(old => ({ ...old, [question.id]: option.value })); setError('') }}><span className="quiz-option-copy"><strong>{option.label}</strong>{'detail' in option && option.detail && <small>{option.detail}</small>}</span><span className="quiz-check" aria-hidden="true">{selected === option.value ? <Check size={18} /> : null}</span></button>)}
      </div>
      {error && <p className="quiz-error" role="alert">{error}</p>}
      <div className="quiz-actions"><button type="button" className="quiz-back" onClick={() => step ? setStep(value => value - 1) : navigate(-1)}><ArrowLeft size={17} /> Voltar</button><button type="button" className="quiz-next" onClick={next}>{step === questions.length - 1 ? 'Personalizar meu espaço' : 'Continuar'} <ArrowRight size={18} /></button></div>
      <p className="quiz-privacy">Sem respostas certas ou erradas. Não precisamos de informações sobre diagnósticos.</p>
    </section>
  </main>
}
