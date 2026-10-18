import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '@netlify/identity'
import { BookOpen, Settings2, UserRound, LogOut, X, Brain, Sparkles } from 'lucide-react'
import { useMonisa } from '../../context/MonisaContext'
import logo from '../../assets/images/MONISA.png'

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useMonisa()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigation = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    navigation.current?.querySelector<HTMLAnchorElement>('nav a')?.focus()
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  async function exit() {
    setBusy(true)
    setError('')
    try { await logout(); navigate('/login', { replace: true }) }
    catch { setError('Não foi possível sair. Tente novamente.'); setBusy(false) }
  }

  return <>
    {open && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={onClose} />}
    <aside ref={navigation} id="study-navigation" className={`study-sidebar ${open ? 'is-open' : ''}`}>
      <NavLink to="/home" className="brand" onClick={onClose}><img src={logo} alt="" /> MONISA</NavLink>
      <button className="close-menu icon-button" aria-label="Fechar menu" onClick={onClose}><X /></button>
      <p className="sidebar-caption">SEU ESPAÇO DE APRENDIZAGEM</p>
      <nav aria-label="Menu principal">
        <NavLink to="/home" onClick={onClose}><BookOpen size={20} />Estudar com a Monisa</NavLink>
        <NavLink to="/quiz" onClick={onClose}><Sparkles size={20} />Meu perfil de aprendizagem</NavLink>
        <NavLink to="/play" onClick={onClose}><Brain size={20} />Monisa Play</NavLink>
        <NavLink to="/settings" onClick={onClose}><Settings2 size={20} />Acessibilidade</NavLink>
        <NavLink to="/profile" onClick={onClose}><UserRound size={20} />Meu perfil</NavLink>
      </nav>
      <div className="sidebar-note optional-detail"><span>Um passo de cada vez.</span><p>Você não precisa aprender como todo mundo. Só precisa encontrar seu jeito.</p></div>
      <div className="sidebar-account">
        {profile?.avatarUrl ? <img className="avatar small" src={profile.avatarUrl} alt="Sua foto" /> : <span className="avatar small avatar-placeholder">{profile?.name.slice(0, 1).toUpperCase() || 'M'}</span>}
        <div><strong>{profile?.name || 'Seu espaço'}</strong><span>Seu ritmo importa</span></div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="signout-button" disabled={busy} onClick={exit}><LogOut size={18} />{busy ? 'Saindo…' : 'Sair da conta'}</button>
    </aside>
  </>
}
