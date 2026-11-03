import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useMonisa } from '../../context/MonisaContext'
import { api, jsonRequest } from '../../lib/api'
import type { Preferences, Profile, QuizAnswers } from '../../lib/preferences'
import './Quiz.css'
import logo from '../../assets/images/MONISA.png'

const questions: { key: keyof QuizAnswers; title: string; options: { label: string; value: string }[] }[] = [
  { key: 'learningStyle', title: 'Como você prefere aprender?', options: [{ label: '📖 Lendo textos', value: 'textos' }, { label: '🎥 Assistindo vídeos', value: 'videos' }, { label: '🎧 Ouvindo explicações', value: 'audio' }, { label: '🖼️ Com imagens e exemplos', value: 'visual' }] },
  { key: 'visualTheme', title: 'Qual tema você prefere?', options: [{ label: '🌙 Escuro', value: 'dark' }, { label: '☀️ Claro', value: 'light' }, { label: '💙 Azul Monisa', value: 'blue' }, { label: '🎨 Personalizado', value: 'custom' }] },
  { key: 'fontSize', title: 'Qual tamanho de texto é mais confortável?', options: [{ label: 'Normal', value: 'normal' }, { label: 'Grande', value: 'large' }, { label: 'Muito grande', value: 'extra-large' }] },
  { key: 'studyPace', title: 'Qual ritmo de estudo você prefere?', options: [{ label: '⚡ Rápido', value: 'fast' }, { label: '🙂 Moderado', value: 'moderate' }, { label: '🌱 Tranquilo', value: 'calm' }] },
  { key: 'firstSubject', title: 'Qual matéria deseja aprender primeiro?', options: [{ label: 'Matemática', value: 'matematica' }, { label: 'Português', value: 'portugues' }, { label: 'Inglês', value: 'ingles' }, { label: 'Programação', value: 'programacao' }, { label: 'Outra', value: 'outra' }] },
]

function preferencesFromAnswers(answers: QuizAnswers): Preferences {
  return {
    theme: answers.visualTheme === 'light' ? 'light' : answers.visualTheme === 'custom' ? 'contrast' : 'dark',
    fontSize: answers.fontSize as Preferences['fontSize'],
    reducedMotion: true,
    simpleLanguage: true,
    responseStyle: answers.studyPace === 'fast' ? 'short' : answers.studyPace === 'calm' ? 'detailed' : 'steps',
    focusMode: answers.studyPace === 'calm',
    breakMinutes: answers.studyPace === 'calm' ? 15 : 25,
  }
}

export default function Quiz() {
  const { profile, setProfile } = useMonisa()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(profile?.quizAnswers || {})
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const question = questions[step]
  const selected = answers[question.key] || ''

  function choose(value: string) {
    setAnswers(previous => ({ ...previous, [question.key]: value }))
    setError('')
  }

  async function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile || busy) return
    if (questions.some(item => !answers[item.key])) { setError('Responda a todas as perguntas para salvar seu perfil.'); return }
    setBusy(true)
    setError('')
    try {
      const completeAnswers = answers as QuizAnswers
      const preferences = preferencesFromAnswers(completeAnswers)
      const updated = await api<Profile>('/api/profile', jsonRequest('PUT', { ...profile, subject: completeAnswers.firstSubject, preferences, quizAnswers: completeAnswers, quizCompleted: true }))
      setProfile(updated)
      navigate('/loading')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar suas respostas. Tente novamente.')
    } finally { setBusy(false) }
  }

  if (!profile) return null
  return <div className="quizPage"><form className="quizCard" onSubmit={finish}>
    <img src={logo} className="quizLogo" alt="Logo Monisa" />
    <h1>Vamos conhecer você 💙</h1>
    <p className="quizSubtitle">Suas respostas ajudam a adaptar seu espaço de aprendizagem. Você pode alterá-las depois.</p>
    <div className="progressBar" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label="Progresso do questionário"><div className="progress" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
    <span className="progressText">{step + 1} / {questions.length}</span>
    <h2>{question.title}</h2>
    <div className="options">{question.options.map(option => <button type="button" key={option.value} className={selected === option.value ? 'option active' : 'option'} aria-pressed={selected === option.value} onClick={() => choose(option.value)}>{option.label}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="button-row quiz-actions">
      {step > 0 && <button className="secondary-button" type="button" disabled={busy} onClick={() => setStep(value => value - 1)}><ArrowLeft size={18} />Voltar</button>}
      {step < questions.length - 1 ? <button className="continueButton" type="button" disabled={!selected || busy} onClick={() => setStep(value => value + 1)}>Continuar <ArrowRight size={18} /></button> : <button className="continueButton" type="submit" disabled={!selected || busy}><Check size={18} />{busy ? 'Salvando…' : 'Salvar e continuar'}</button>}
    </div>
  </form></div>
}
