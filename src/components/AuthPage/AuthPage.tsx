import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthError, MissingIdentityError, login, signup, requestPasswordRecovery, updateUser } from '@netlify/identity'
import { Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react'
import { useMonisa } from '../../context/MonisaContext'
import logo from '../../assets/images/MONISA.png'

export default function AuthPage({ register = false }: { register?: boolean }) {
  const { user, loading, error: sessionError, recoveryRequired, finishRecovery } = useMonisa()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (recoveryRequired) {
        await updateUser({ password })
        finishRecovery()
        navigate('/home')
      } else if (register) {
        const created = await signup(email.trim(), password, { full_name: name.trim() })
        if (created.confirmedAt) navigate('/quiz')
        else {
          setNotice('Conta criada! Confira sua caixa de entrada e confirme seu e-mail para entrar. Depois, você poderá acessar o quiz pelo menu.')
          setPassword('')
        }
      } else {
        await login(email.trim(), password)
        navigate(localStorage.getItem('monisa-quiz-complete') === 'true' ? '/home' : '/quiz')
      }
    } catch (failure) {
      if (failure instanceof MissingIdentityError) setError('O acesso está temporariamente indisponível. Tente novamente após a publicação do site.')
      else if (failure instanceof AuthError && failure.status === 401) setError('Não foi possível entrar. Confira o e-mail, a senha e a confirmação por e-mail.')
      else if (register) setError('Não foi possível criar a conta. Confira os dados ou tente entrar se já tem uma conta.')
      else setError('Não foi possível concluir. Confira se seu e-mail foi confirmado e tente novamente.')
    } finally { setBusy(false) }
  }

  async function recover() {
    if (!email.trim()) { setError('Preencha seu e-mail para receber o link de recuperação.'); return }
    setBusy(true)
    setError('')
    try {
      await requestPasswordRecovery(email.trim())
      setNotice('Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.')
    } catch { setError('Não foi possível enviar o link agora. Tente novamente.') }
    finally { setBusy(false) }
  }

  if (loading) return <div className="page-loading" role="status">Preparando seu espaço…</div>
  if (user && !recoveryRequired) return <Navigate to="/home" replace />

  return <main className="auth-page">
    <section className="auth-story" aria-label="Sobre a Monisa">
      <Link to="/welcome" className="brand"><img src={logo} alt="" /> MONISA</Link>
      <span className="eyebrow">SEU RITMO. SEU JEITO.</span>
      <h1>Aprender pode<br />ser mais leve.</h1>
      <p>Um espaço tranquilo para suas perguntas, suas descobertas e suas pequenas grandes conquistas.</p>
      <div className="auth-story-note"><BookOpen aria-hidden="true" /><span>Explicações adaptadas a você.<br />Sem pressa. Sem julgamentos.</span></div>
    </section>
    <section className="auth-panel">
      <div className="auth-panel-inner">
        <span className="eyebrow">BEM-VINDO AO SEU ESPAÇO</span>
        <h2>{recoveryRequired ? 'Uma nova senha' : register ? 'Vamos começar?' : 'Que bom ter você aqui.'}</h2>
        <p>{recoveryRequired ? 'Escolha uma senha segura para voltar aos estudos.' : register ? 'Crie sua conta e personalize sua experiência.' : 'Entre para continuar aprendendo do seu jeito.'}</p>
        <form onSubmit={submit} className="stack-form">
          {register && !recoveryRequired && <label>Como podemos chamar você?<input autoComplete="name" required maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Seu nome" /></label>}
          {!recoveryRequired && <label>E-mail<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></label>}
          <label>Senha<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={register || recoveryRequired ? 'new-password' : 'current-password'} required minLength={register || recoveryRequired ? 8 : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} placeholder={register || recoveryRequired ? 'Pelo menos 8 caracteres' : 'Sua senha'} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
          {(error || sessionError) && <p className="form-error" role="alert">{error || sessionError}</p>}
          {notice && <p className="form-success" role="status">{notice}</p>}
          <button className="primary-button" disabled={busy} type="submit">{busy ? 'Aguarde um instante…' : recoveryRequired ? 'Salvar nova senha' : register ? 'Criar minha conta' : 'Entrar no meu espaço'}<ArrowRight size={18} aria-hidden="true" /></button>
          {!register && !recoveryRequired && <button className="text-button" type="button" disabled={busy} onClick={recover}>Esqueci minha senha</button>}
        </form>
        {!recoveryRequired && <p className="auth-switch">{register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <Link to={register ? '/login' : '/register'}>{register ? 'Entrar' : 'Criar conta'}</Link></p>}
        <p className="privacy-note">Você escolhe suas preferências. Não é necessário informar diagnósticos.</p>
      </div>
    </section>
  </main>
}
