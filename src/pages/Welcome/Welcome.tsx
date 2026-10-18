import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/images/MONISA.png'
import { defaultPreferences } from '../../lib/preferences'

export default function Welcome() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function start() {
    const cleanName = name.trim()
    if (!cleanName) { setError('Digite seu nome para começar.'); return }
    const profile = {
      name: cleanName,
      bio: '',
      subject: '',
      learningProfile: null,
      avatarUrl: null,
      preferences: defaultPreferences,
    }
    localStorage.setItem('monisa-demo-profile', JSON.stringify(profile))
    localStorage.removeItem('monisa-learning-profile')
    localStorage.removeItem('monisa-quiz-complete')
    navigate('/quiz', { replace: true })
    window.location.reload()
  }

  return <main className="welcomePage">
    <section className="welcomeCard">
      <img src={logo} className="welcomeLogo" alt="Logo Monisa" />
      <h1>Olá, seja bem-vindo(a)! 💙</h1>
      <p>Uma plataforma criada para você aprender do seu jeito, com uma experiência personalizada e acessível.</p>
      <label htmlFor="demo-name">Como podemos chamar você?</label>
      <input id="demo-name" autoComplete="name" maxLength={80} value={name} onChange={event => { setName(event.target.value); setError('') }} placeholder="Digite seu nome" onKeyDown={event => { if (event.key === 'Enter') start() }} />
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="startButton" onClick={start}>Começar</button>
      <p className="privacy-note">Modo de demonstração: não é necessário criar conta ou informar senha.</p>
    </section>
  </main>
}
