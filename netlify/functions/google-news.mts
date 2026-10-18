export default async (request: Request) => {
  const url = new URL(request.url)
  const query = (url.searchParams.get('q') || 'neurodivergência educação').slice(0, 160)
  const feed = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=pt-BR&gl=BR&ceid=BR:pt-419'
  try {
    const response = await fetch(feed)
    if (!response.ok) throw new Error('Google Notícias indisponível')
    const xml = await response.text()
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 12)
    const decode = (value: string) => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    const get = (item: string, key: string) => decode(item.match(new RegExp('<' + key + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + key + '>', 'i'))?.[1]?.trim() || '')
    const articles = items.map(match => {
      const item = match[1]
      return { title: get(item, 'title'), link: get(item, 'link'), source: get(item, 'source'), publishedAt: get(item, 'pubDate') }
    }).filter(item => item.title && item.link.startsWith('http'))
    return new Response(JSON.stringify({ articles }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
  } catch {
    return new Response(JSON.stringify({ articles: [], error: 'Não foi possível carregar os resultados agora.' }), { status: 502, headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  }
}
export const config = { path: '/api/google-news' }
