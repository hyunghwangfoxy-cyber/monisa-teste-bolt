import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Article = { title: string; link: string; source: string; publishedAt: string }

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
        return response.json() as Promise<{ articles: Article[] }>
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

  return <section style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>
    <p className="eyebrow">SEU PERFIL DE APRENDIZAGEM</p>
    <h1>Descubra algo novo</h1>
    <p>Seu quiz já foi concluído! Pesquise notícias e conteúdos sobre neurodivergência, educação ou qualquer assunto que desperte sua curiosidade.</p>
    <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você quer saber?" aria-label="O que você quer saber?" style={{ flex: '1 1 240px', padding: 12, borderRadius: 12 }} />
      <button className="primary-button" type="submit">Pesquisar</button>
    </form>
    <h2>Notícias sobre: {search}</h2>
    {loading && <p role="status">Buscando notícias recentes…</p>}
    {error && <p role="alert">{error} <a href={'https://news.google.com/search?q=' + encodeURIComponent(search)} target="_blank" rel="noreferrer">Abrir no Google Notícias ↗</a></p>}
    {!loading && !error && articles.length === 0 && <p>Nenhum resultado encontrado. <a href={'https://news.google.com/search?q=' + encodeURIComponent(search)} target="_blank" rel="noreferrer">Ver a pesquisa no Google Notícias ↗</a></p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 16, marginTop: 18 }}>
      {articles.map((article, index) => <article key={article.link || index} style={{ padding: 18, borderRadius: 16, border: '1px solid var(--border, #344054)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <small>{article.source || 'Google Notícias'}{article.publishedAt ? ' · ' + new Date(article.publishedAt).toLocaleDateString('pt-BR') : ''}</small>
        <h3 style={{ margin: 0, lineHeight: 1.4 }}>{article.title}</h3>
        <a href={article.link} target="_blank" rel="noreferrer" style={{ marginTop: 'auto' }}>Ler notícia ↗</a>
      </article>)}
    </div>
    <p style={{ marginTop: 24, fontSize: 13, opacity: .8 }}>Os resultados vêm do Google Notícias. Nem todas as publicações fornecem imagens no feed.</p>
  </section>
}
