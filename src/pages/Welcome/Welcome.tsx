import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Brain, Sparkles, ShieldCheck } from 'lucide-react'
import logo from '../../assets/images/MONISA.png'
import './Welcome.css'

export default function Welcome() {
  return (
    <main className="welcomePage">
      <div className="welcomeGlow welcomeGlowOne" aria-hidden="true" />
      <div className="welcomeGlow welcomeGlowTwo" aria-hidden="true" />
      <header className="welcomeHeader">
        <Link to="/" className="welcomeBrand" aria-label="Monisa início">
          <img src={logo} alt="" />
          <span>MONISA</span>
        </Link>
        <nav className="welcomeNav" aria-label="Acesso">
          <Link to="/login" className="welcomeLogin">Entrar</Link>
          <Link to="/register" className="welcomeSignup">Criar conta <ArrowRight size={17} /></Link>
        </nav>
      </header>

      <section className="welcomeHero">
        <div className="welcomeCopy">
          <span className="welcomeEyebrow"><Sparkles size={15} /> SEU ESPAÇO, SEU RITMO</span>
          <h1>Aprenda do<br /><span>seu jeito.</span></h1>
          <p>Um espaço de aprendizagem que respeita seu ritmo, acolhe suas dúvidas e adapta a experiência ao que funciona melhor para você.</p>
          <div className="welcomeActions">
            <Link to="/register" className="welcomePrimary">Começar agora <ArrowRight size={18} /></Link>
            <Link to="/login" className="welcomeSecondary">Já tenho uma conta</Link>
          </div>
          <div className="welcomeTrust"><ShieldCheck size={17} /> Suas preferências, seu conforto e suas escolhas.</div>
        </div>
        <div className="welcomeVisual" aria-label="Recursos da Monisa">
          <div className="welcomeOrb" aria-hidden="true" />
          <div className="welcomeFeature welcomeFeatureTop"><span className="welcomeFeatureIcon"><Brain size={20} /></span><span><strong>Aprendizagem personalizada</strong><small>Conteúdos no seu ritmo</small></span></div>
          <div className="welcomeLogoCard"><img src={logo} alt="Logo Monisa" /><span>Aprenda do seu jeito!</span></div>
          <div className="welcomeFeature welcomeFeatureBottom"><span className="welcomeFeatureIcon"><BookOpen size={20} /></span><span><strong>Um espaço para descobrir</strong><small>Pergunte, pratique e evolua</small></span></div>
          <span className="welcomeSpark welcomeSparkA">✦</span><span className="welcomeSpark welcomeSparkB">✧</span>
        </div>
      </section>
      <footer className="welcomeFooter"><span>MONISA</span><span>Aprender não precisa ser igual para todo mundo.</span></footer>
    </main>
  )
}
