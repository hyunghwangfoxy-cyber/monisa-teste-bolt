import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Article = { title: string; link: string; source: string; publishedAt: string }

const accents = [
  { background: 'linear-gradient(135deg, rgba(139, 92, 246, .14), rgba(139, 92, 246, .04))', mark: '✦' },
  { background: 'linear-gradient(135deg, rgba(59, 130, 246, .13), rgba(59, 130, 246, .04))', mark: '↗' },
  { background: 'linear-gradient(135deg, rgba(236, 72, 153, .12), rgba(236, 72, 153, .04))', mark: '✳' },
  { background: 'linear-gradient(135deg, rgba(20, 184, 166, .12), rgba(20, 184, 166, .04))', mark: '◌' },
]

export default function LearningHub() {
  const [query, setQuery] = useState('neurodivergência educação')
  const [search, setSearch] = useState('neurodivergência educação')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetch('/api/google-news?q=' + encodeURIComponent(search), { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Não foi possível carregar as notícias agora.')
        return response.json() as Promise<{ articles: Article[] }>()
      })
      .then(data => setArticles(data.articles || []))
      .catch(failure => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Erro ao buscar notícias.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [search])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) setSearch(query.trim())
  }

  const googleNewsUrl = 'https://news.google.com/search?q=' + encodeURIComponent(search)

  return <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(18px, 3vw, 32px)' }}>
    <div style={{ padding: 'clamp(22px, 4vw, 36px)', borderRadius: 26, background: 'linear-gradient(125deg, rgba(124, 91, 235, .16), rgba(75, 132, 239, .08) 58%, rgba(20, 184, 166, .08))', marginBottom: 30 }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>UM ESPAÇO PARA EXPLORAR</p>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.15, margin: '0 0 12px' }}>Descubra algo novo <span aria-hidden="true">✦</span></h1>
      <p style={{ maxWidth: 650, lineHeight: 1.7, margin: 0, opacity: .86 }}>Seu quiz já foi concluído. Agora, siga sua curiosidade: pesquise assuntos, encontre novas ideias e descubra conteúdos que façam sentido para você.</p>
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você quer descobrir?" aria-label="O que você quer descobrir?" style={{ flex: '1 1 260px', minWidth: 0, padding: '14px 17px', borderRadius: 15, border: 'none', outlineOffset: 3, background: 'var(--input-bg, var(--surface, rgba(255,255,255,.8)))', color: 'inherit', boxShadow: '0 4px 18px rgba(25, 25, 60, .06)' }} />
        <button className="primary-button" type="submit" style={{ borderRadius: 15, padding: '12px 20px' }}>Explorar ↗</button>
      </form>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 13, alignItems: 'center' }}>
        <span style={{ fontSize: 12, opacity: .7 }}>Sugestões:</span>
        {['Técnicas de estudo', 'Saúde mental', 'Tecnologia e IA'].map(topic => <button key={topic} type="button" onClick={() => { setQuery(topic); setSearch(topic) }} style={{ border: 'none', borderRadius: 999, padding: '7px 11px', background: 'var(--surface, rgba(255,255,255,.55))', color: 'inherit', cursor: 'pointer', fontSize: 12 }}>{topic}</button>)}
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', flexWrap: 'wrap', marginBottom: 16 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 6 }}>FEED DE DESCOBERTAS</p>
        <h2 style={{ margin: 0, fontSize: 22 }}>Sobre: {search}</h2>
      </div>
      <a href={googleNewsUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, textDecoration: 'none' }}>Ver no Google Notícias ↗</a>
    </div>

    {loading && <p role="status" style={{ padding: '18px 0', opacity: .8 }}>✦ Procurando novidades para você…</p>}
    {error && <p role="alert" style={{ padding: 16, borderRadius: 14, background: 'rgba(239, 68, 68, .08)' }}>{error} <a href={googleNewsUrl} target="_blank" rel="noreferrer">Abrir no Google Notícias ↗</a></p>}
    {!loading && !error && articles.length === 0 && <p style={{ padding: 18, borderRadius: 16, background: 'var(--surface, rgba(128,128,128,.08))' }}>Nenhum resultado por aqui ainda. Tente outras palavras ou <a href={googleNewsUrl} target="_blank" rel="noreferrer">veja a pesquisa no Google Notícias ↗</a>.</p>}

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14, marginTop: 18 }}>
      {articles.map((article, index) => {
        const accent = accents[index % accents.length]
        return <article key={article.link || index} style={{ minHeight: 190, padding: 21, borderRadius: 20, background: accent.background, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 13, transition: 'transform .18s ease, box-shadow .18s ease' }}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 19, opacity: .8 }} aria-hidden="true">{accent.mark}</span>
            <small style={{ opacity: .72, textAlign: 'right' }}>{article.source || 'Google Notícias'}{article.publishedAt ? ' · ' + new Date(article.publishedAt).toLocaleDateString('pt-BR') : ''}</small>
          </div>
          <h3 style={{ margin: 0, lineHeight: 1.45, fontSize: 17, fontWeight: 600 }}>{article.title}</h3>
          <a href={article.link} target="_blank" rel="noreferrer" style={{ marginTop: 'auto', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Ler notícia <span aria-hidden="true">↗</span></a>
        </article>
      })}
    </div>
    <p style={{ marginTop: 22, fontSize: 12, opacity: .65 }}>Conteúdos encontrados no Google Notícias. As imagens dependem do que cada publicação disponibiliza no feed.</p>
  </section>
}
