import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react'
import { useMonisa } from '../../context/MonisaContext'
import logo from '../../assets/images/MONISA.png'
import { api } from '../../lib/api'
import { supabase, supabaseConfigured } from '../../lib/supabase'

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
  const [destination, setDestination] = useState<string | null>(null)

  useEffect(() => {
    if (!user || recoveryRequired) { setDestination(null); return }
    let active = true
    api<{ learningProfile: Record<string, string> | null }>('/api/profile')
      .then(saved => { if (active) setDestination(saved.learningProfile?.completedAt ? '/home' : '/quiz') })
      .catch(() => { if (active) setDestination('/quiz') })
    return () => { active = false }
  }, [user?.id, recoveryRequired])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (!supabaseConfigured) throw new Error('A conexão ainda não foi configurada. Adicione as variáveis do Supabase na Vercel e publique o Preview novamente.')
      if (recoveryRequired) {
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) throw updateError
        finishRecovery()
        setNotice('Senha atualizada! Entre com sua nova senha.')
        navigate('/login', { replace: true })
      } else if (register) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })
        if (signUpError) throw signUpError
        if (data.session) navigate('/quiz')
        else {
          setNotice('Conta criada! Confira seu e-mail e confirme o cadastro. Depois, volte aqui para entrar.')
          setPassword('')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
        if (signInError) throw signInError
        try {
          const saved = await api<{ learningProfile: Record<string, string> | null }>('/api/profile')
          navigate(saved.learningProfile?.completedAt ? '/home' : '/quiz')
        } catch {
          navigate('/quiz')
        }
      }
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : ''
      if (message.toLowerCase().includes('already registered')) setError('Este e-mail já tem uma conta. Tente entrar.')
      else if (message.toLowerCase().includes('invalid login credentials')) setError('E-mail ou senha incorretos.')
      else if (message.toLowerCase().includes('email not confirmed')) setError('Confirme seu e-mail antes de entrar. Confira também a caixa de spam.')
      else setError(message || 'Não foi possível concluir. Confira os dados e tente novamente.')
    } finally { setBusy(false) }
  }

  async function recover() {
    if (!email.trim()) { setError('Preencha seu e-mail para receber o link de recuperação.'); return }
    if (!supabaseConfigured) { setError('A conexão com o Supabase ainda não foi configurada.'); return }
    setBusy(true)
    setError('')
    try {
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      })
      if (recoveryError) throw recoveryError
      setNotice('Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.')
    } catch { setError('Não foi possível enviar o link agora. Confira o e-mail e tente novamente.') }
    finally { setBusy(false) }
  }

  if (loading) return <div className="page-loading" role="status">Preparando seu espaço…</div>
  if (user && !recoveryRequired) return destination ? <Navigate to={destination} replace /> : <div className="page-loading" role="status">Preparando seu espaço…</div>

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
        {!supabaseConfigured && <p className="form-error" role="alert">A conexão do banco ainda precisa ser configurada na Vercel.</p>}
        <form onSubmit={submit} className="stack-form">
          {register && !recoveryRequired && <label>Como podemos chamar você?<input autoComplete="name" required maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Seu nome" /></label>}
          {!recoveryRequired && <label>E-mail<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></label>}
          <label>Senha<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={register || recoveryRequired ? 'new-password' : 'current-password'} required minLength={register || recoveryRequired ? 8 : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} placeholder={register || recoveryRequired ? 'Pelo menos 8 caracteres' : 'Sua senha'} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
          {(error || sessionError) && <p className="form-error" role="alert">{error || sessionError}</p>}
          {notice && <p className="form-success" role="status">{notice}</p>}
          <button className="primary-button" disabled={busy || !supabaseConfigured} type="submit">{busy ? 'Aguarde um instante…' : recoveryRequired ? 'Salvar nova senha' : register ? 'Criar minha conta' : 'Entrar no meu espaço'}<ArrowRight size={18} aria-hidden="true" /></button>
          {!register && !recoveryRequired && <button className="text-button" type="button" disabled={busy || !supabaseConfigured} onClick={recover}>Esqueci minha senha</button>}
        </form>
        {!recoveryRequired && <p className="auth-switch">{register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <Link to={register ? '/login' : '/register'}>{register ? 'Entrar' : 'Criar conta'}</Link></p>}
        <p className="privacy-note">Você escolhe suas preferências. Não é necessário informar diagnósticos.</p>
      </div>
    </section>
  </main>
}
