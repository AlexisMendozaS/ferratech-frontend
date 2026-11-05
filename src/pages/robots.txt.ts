import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site, url }) => {
  const origen = (site?.origin ?? url.origin).replace(/\/$/, '')
  const cuerpo = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /login', 'Disallow: /cotizacion', '', `Sitemap: ${origen}/sitemap.xml`, ''].join('\n')
  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
