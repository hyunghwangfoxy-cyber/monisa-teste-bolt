import { useCallback, useRef, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useMonisa } from '../context/MonisaContext'
import Sidebar from './Sidebar/Sidebar'
import '../styles/monisa-polish.css'
import '../styles/monisa-experience.css'

export default function StudyLayout() {
  const { user, loading, profile, profileLoading, error, refreshProfile } = useMonisa()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => { setMenuOpen(false); menuToggle.current?.focus() }, [])
  if (loading) return <div className="page-loading" role="status">Preparando seu espaço…</div>
  if (!user) return <Navigate to="/login" replace />

  if (!profile) return <div className="page-loading" role="status">
    {profileLoading ? 'Carregando seu perfil…' : <section className="settings-card"><h1>Não conseguimos carregar seu espaço.</h1><p className="form-error" role="alert">{error || 'Verifique sua conexão e tente novamente.'}</p><button className="primary-button" disabled={profileLoading} onClick={() => void refreshProfile().catch(() => undefined)}>Tentar novamente</button></section>}
  </div>

  return <div className={`study-app${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    <Sidebar open={menuOpen} onClose={closeMenu} />
    <div className="study-main">
      <header className="study-header">
        <button className="desktop-sidebar-toggle icon-button" type="button" aria-label={sidebarCollapsed ? 'Mostrar menu lateral' : 'Ocultar menu lateral'} aria-expanded={!sidebarCollapsed} aria-controls="study-navigation" title={sidebarCollapsed ? 'Mostrar menu lateral' : 'Ocultar menu lateral'} onClick={() => setSidebarCollapsed(value => !value)}>{sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</button>
        <button ref={menuToggle} className="mobile-menu icon-button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="study-navigation" onClick={() => setMenuOpen(true)}><Menu /></button>
      </header>
      <main id="main-content" className="study-content" tabIndex={-1}><Outlet /></main>
    </div>
  </div>
}
