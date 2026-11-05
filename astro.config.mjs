// Sitio público en Astro (HTML generado en el servidor, para el SEO) y panel React montado en
// /admin, en un solo proyecto y un solo despliegue (DEC-006, DEC-015).
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Dominio público (canónicas, sitemap). Sin él se usa el origen de cada petición.
  site: process.env.PUBLIC_SITE_URL || undefined,
  // Las páginas se generan por petición; el CDN de Vercel las guarda según su Cache-Control.
  output: 'server',
  adapter: vercel(),
  integrations: [react({ compiler: true })],
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['VITE_', 'PUBLIC_'],
    resolve: { alias: { '@': path.resolve(raiz, './src') } },
  },
})
