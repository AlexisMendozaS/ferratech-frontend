/** sitemap.xml con la portada, las categorías y todos los productos publicados (INI-007). */
import type { APIRoute } from 'astro'

import { api } from '@/lib/api'

export const GET: APIRoute = async ({ site, url }) => {
  const origen = (site?.origin ?? url.origin).replace(/\/$/, '')
  const categorias = (await api.categorias()).filter((c) => c.estado !== 'oculta')
  const productos: { slug: string }[] = []
  for (let page = 1; ; page++) {
    const r = await api.buscar({ page, limit: 48 })
    productos.push(...r.productos)
    if (productos.length >= r.total || r.productos.length === 0) break
  }
  const urls = [
    { loc: '/', prioridad: '1.0' },
    ...categorias.map((c) => ({ loc: `/categoria/${c.slug}`, prioridad: c.padre ? '0.7' : '0.8' })),
    ...productos.map((p) => ({ loc: `/producto/${p.slug}`, prioridad: '0.9' })),
    { loc: '/cobertura', prioridad: '0.6' },
    { loc: '/preguntas-frecuentes', prioridad: '0.3' },
  ]
  const cuerpo = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${origen}${u.loc}</loc><priority>${u.prioridad}</priority></url>`).join('\n')}
</urlset>
`
  return new Response(cuerpo, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
