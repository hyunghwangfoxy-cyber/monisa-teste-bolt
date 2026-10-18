import { useCallback, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Menu, Heart } from 'lucide-react'
import { useMonisa } from '../context/MonisaContext'
import Sidebar from './Sidebar/Sidebar'

export default function StudyLayout() {
  const { loading, profile, profileLoading, error, refreshProfile } = useMonisa()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => { setMenuOpen(false); menuToggle.current?.focus() }, [])
  const location = useLocation()
  if (loading) return <div className="page-loading" role="status">Preparando seu espaço…</div>
  if (!profile) return <Navigate to="/" replace />

  return <div className="study-app">
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <Sidebar open={menuOpen} onClose={closeMenu} />
    <div className="study-main">
      <header className="study-header">
        <button ref={menuToggle} className="mobile-menu icon-button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="study-navigation" onClick={() => setMenuOpen(true)}><Menu /></button>
        <span>{location.pathname === '/settings' ? 'Meu jeito de aprender' : location.pathname === '/profile' ? 'Meu perfil' : 'Estudar com a Monisa'}</span>
        <span className="header-note optional-detail"><Heart size={15} aria-hidden="true" />Feito para o seu ritmo</span>
      </header>
      <main id="main-content" className="study-content" tabIndex={-1}>
        {profileLoading && !profile ? <div className="content-skeleton" role="status">Carregando suas preferências…</div> : !profile ? <section className="settings-card"><h1>Seu espaço ainda está carregando</h1><p className="form-error" role="alert">{error || 'Não foi possível carregar seu perfil.'}</p><button className="primary-button" disabled={profileLoading} onClick={refreshProfile}>Tentar novamente</button></section> : <Outlet />}
      </main>
    </div>
  </div>
}
