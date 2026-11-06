import { useCallback, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu, Heart } from 'lucide-react'
import { useMonisa } from '../context/MonisaContext'
import Sidebar from './Sidebar/Sidebar'
import '../styles/monisa-polish.css'

export default function StudyLayout() {
  const { user, loading, profile, profileLoading, error, refreshProfile } = useMonisa()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => { setMenuOpen(false); menuToggle.current?.focus() }, [])
  const location = useLocation()
  if (loading) return <div className="page-loading" role="status">Preparando seu espaço…</div>
  if (!user) return <Navigate to="/login" replace />

  if (!profile) return <div className="page-loading" role="status">
    {profileLoading ? 'Carregando seu perfil…' : <section className="settings-card"><h1>Não conseguimos carregar seu espaço.</h1><p className="form-error" role="alert">{error || 'Verifique sua conexão e tente novamente.'}</p><button className="primary-button" disabled={profileLoading} onClick={() => void refreshProfile().catch(() => undefined)}>Tentar novamente</button></section>}
  </div>

  return <div className="study-app">
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <Sidebar open={menuOpen} onClose={closeMenu} />
    <div className="study-main">
      <header className="study-header">
        <button ref={menuToggle} className="mobile-menu icon-button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="study-navigation" onClick={() => setMenuOpen(true)}><Menu /></button>
        <span>{location.pathname === '/settings' ? 'Acessibilidade e personalização' : location.pathname === '/profile' ? 'Meu perfil' : location.pathname === '/faq' ? 'Dúvidas frequentes' : location.pathname === '/study-space' ? 'Espaço de Estudos' : 'Estudar com a Monisa'}</span>
        <span className="header-note optional-detail"><Heart size={15} aria-hidden="true" />Feito para o seu ritmo</span>
      </header>
      <main id="main-content" className="study-content" tabIndex={-1}><Outlet /></main>
    </div>
  </div>
}
