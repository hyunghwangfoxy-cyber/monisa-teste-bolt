type RequestLike = { method?: string; query?: Record<string, string | string[] | undefined> }
type ResponseLike = { status(code: number): ResponseLike; json(value: unknown): void; setHeader(name: string, value: string): void }

const categories = new Set(['general', 'technology', 'science', 'health', 'nation', 'world', 'business', 'entertainment', 'sports'])

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' })
  const rawCategory = req.query?.category
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory || 'general'
  if (!categories.has(category)) return res.status(400).json({ error: 'Categoria inválida.' })
  const key = process.env.GNEWS_API_KEY
  if (!key) return res.status(503).json({ error: 'As notícias ainda não foram ativadas. Adicione GNEWS_API_KEY nas variáveis de ambiente da Vercel.' })
  try {
    const url = new URL('https://gnews.io/api/v4/top-headlines')
    url.searchParams.set('lang', 'pt')
    url.searchParams.set('country', 'br')
    url.searchParams.set('max', '10')
    url.searchParams.set('topic', category)
    url.searchParams.set('apikey', key)
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return res.status(502).json({ error: 'O serviço de notícias está temporariamente indisponível.' })
    const data = await response.json() as { articles?: Array<{ title?: string; description?: string; url?: string; image?: string; publishedAt?: string; source?: { name?: string } }> }
    const articles = (data.articles || []).map(article => ({
      title: article.title || 'Notícia sem título',
      description: article.description || 'Abra a notícia para conferir os detalhes.',
      url: article.url || '',
      image: article.image || '',
      publishedAt: article.publishedAt || '',
      source: article.source?.name || 'Fonte original',
    })).filter(article => article.url)
    return res.status(200).json({ articles, category, updatedAt: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'Não foi possível buscar notícias agora. Tente novamente.' })
  }
}
