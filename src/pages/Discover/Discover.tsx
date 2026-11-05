import { useEffect, useState } from 'react'
import { BookOpen, ExternalLink, Newspaper, RefreshCw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

type Article = { title: string; description: string; url: string; image: string; publishedAt: string; source: string }
type DiscoverResponse = { articles: Article[]; error?: string }

const categories = [
  { id: 'general', label: 'Destaques' },
  { id: 'technology', label: 'Tecnologia' },
  { id: 'science', label: 'Ciência' },
  { id: 'health', label: 'Saúde' },
  { id: 'nation', label: 'Brasil' },
  { id: 'world', label: 'Mundo' },
]

const lessons = [
  { title: 'Ciência no cotidiano', description: 'Entenda descobertas científicas e como elas aparecem no dia a dia.', prompt: 'Quero aprender ciência a partir de exemplos do cotidiano.' },
  { title: 'Tecnologia e inteligência artificial', description: 'Explore como funcionam algoritmos, IA e ferramentas digitais.', prompt: 'Me ensine os fundamentos de inteligência artificial com exemplos simples.' },
  { title: 'Meio ambiente e sustentabilidade', description: 'Estude clima, biodiversidade, energia e consumo consciente.', prompt: 'Quero estudar meio ambiente e sustentabilidade com explicações e exemplos.' },
  { title: 'História e sociedade', description: 'Conecte acontecimentos históricos aos debates do presente.', prompt: 'Me ajude a estudar história e sociedade relacionando passado e presente.' },
  { title: 'Matemática aplicada', description: 'Veja como porcentagens, proporções e gráficos ajudam a interpretar informações.', prompt: 'Quero aprender matemática aplicada a notícias, gráficos e situações reais.' },
  { title: 'Leitura crítica de notícias', description: 'Aprenda a comparar fontes, reconhecer contexto e checar informações.', prompt: 'Me ensine a analisar criticamente uma notícia e verificar suas fontes.' },
]

function formatDate(value: string) {
  if (!value) return 'Data não informada'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Data não informada' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)
}

export default function Discover() {
  const [category, setCategory] = useState('general')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadNews(nextCategory = category) {
    setLoading(true)
    setError('')
    try {
      const result = await api<DiscoverResponse>('/api/discover?category=' + encodeURIComponent(nextCategory))
      setArticles(result.articles || [])
    } catch (failure) {
      setArticles([])
      setError(failure instanceof Error ? failure.message : 'Não foi possível carregar as notícias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadNews(category) }, [category])

  return <div className="discover-page">
    <header className="page-heading">
      <span className="eyebrow">CURIOSIDADE QUE VIRA APRENDIZADO</span>
      <h1>Descobrir conteúdos</h1>
      <p>Notícias atuais e temas educativos para ampliar seus conhecimentos, no seu ritmo.</p>
    </header>

    <section className="discover-section" aria-labelledby="news-title">
      <div className="discover-section-heading">
        <div><span className="discover-icon"><Newspaper size={20} /></span><div><h2 id="news-title">Notícias do momento</h2><p>Atualizações de fontes jornalísticas externas.</p></div></div>
        <button className="secondary-button discover-refresh" type="button" onClick={() => void loadNews()} disabled={loading}><RefreshCw size={16} />Atualizar</button>
      </div>
      <div className="discover-categories" aria-label="Categorias de notícias">
        {categories.map(item => <button key={item.id} type="button" className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
      </div>
      {loading && <div className="content-skeleton" role="status">Buscando notícias recentes…</div>}
      {!loading && error && <div className="form-error" role="alert">{error}<p>As notícias precisam de uma chave GNews configurada no servidor da Vercel.</p></div>}
      {!loading && !error && articles.length === 0 && <p className="discover-empty">Nenhuma notícia encontrada nesta categoria. Tente outra.</p>}
      {!loading && !error && <div className="news-grid">{articles.map((article, index) => <article className="news-card" key={article.url || index}>
        {article.image ? <img src={article.image} alt="" loading="lazy" /> : <div className="news-image-placeholder"><Newspaper size={30} /></div>}
        <div className="news-card-content"><span className="news-meta">{article.source} · {formatDate(article.publishedAt)}</span><h3>{article.title}</h3><p>{article.description}</p><a href={article.url} target="_blank" rel="noreferrer">Ler na fonte original <ExternalLink size={14} /></a></div>
      </article>)}</div>}
    </section>

    <section className="discover-section" aria-labelledby="learning-title">
      <div className="discover-section-heading"><div><span className="discover-icon"><BookOpen size={20} /></span><div><h2 id="learning-title">Trilhas para aprender</h2><p>Conteúdos educativos para explorar com a Monisa.</p></div></div></div>
      <div className="learning-grid">{lessons.map(lesson => <article className="learning-card" key={lesson.title}><span><Sparkles size={18} /></span><h3>{lesson.title}</h3><p>{lesson.description}</p><Link to="/home" state={{ prompt: lesson.prompt }}>Estudar com a Monisa <ExternalLink size={14} /></Link></article>)}</div>
    </section>
  </div>
}
