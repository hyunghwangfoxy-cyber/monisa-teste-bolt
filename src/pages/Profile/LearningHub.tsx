import { useState } from 'react'

export default function LearningHub() {
  const [query, setQuery] = useState('neurodivergência educação')
  const [search, setSearch] = useState('neurodivergência educação')
  return <section style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
    <p className="eyebrow">SEU PERFIL DE APRENDIZAGEM</p>
    <h1>Descubra algo novo</h1>
    <p>Seu quiz já foi concluído! Pesquise notícias e conteúdos sobre neurodivergência, educação ou qualquer assunto que desperte sua curiosidade.</p>
    <form onSubmit={event => { event.preventDefault(); if (query.trim()) setSearch(query.trim()) }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você quer saber?" aria-label="O que você quer saber?" style={{ flex: '1 1 240px', padding: 12, borderRadius: 12 }} />
      <button className="primary-button" type="submit">Pesquisar</button>
    </form>
    <p style={{ marginTop: 20 }}>Resultados atualizados pelo Google Notícias para: <strong>{search}</strong></p>
    <p><a href={'https://news.google.com/search?q=' + encodeURIComponent(search)} target="_blank" rel="noreferrer">Ver notícias sobre este tema no Google Notícias ↗</a></p>
    <div style={{ marginTop: 24, padding: 18, borderRadius: 16, border: '1px solid var(--border, #344054)' }}>
      <h2>Seu espaço continua sendo seu</h2>
      <p>Você pode explorar outros temas a qualquer momento. Os resultados abrem no Google Notícias, e a Monisa mantém suas preferências de aprendizagem.</p>
    </div>
  </section>
}
