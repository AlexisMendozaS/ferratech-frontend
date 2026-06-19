import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'

const LINKS_ACCESO_RAPIDO = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/productos' },
  { label: 'Ofertas Especiales', href: '/productos?oferta=true' },
  { label: 'Servicios', href: '/' },
  { label: 'Admin Productos', href: '/admin/productos' },
  { label: 'Contacto', href: '/' },
]

const LINKS_SERVICIO = [
  { label: 'Estado de Orden', href: '/' },
  { label: 'Información de entrega', href: '/' },
  { label: 'Política de Devoluciones', href: '/' },
  { label: 'Preguntas Frecuentes', href: '/faq' },
  { label: 'Centro de Ayuda', href: '/' },
]

const SOCIAL = [
  {
    href: '#', label: 'Facebook',
    svg: <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.563 9.878v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988A10.003 10.003 0 0 0 22 12z"/></svg>,
  },
  {
    href: '#', label: 'X (Twitter)',
    svg: <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    href: '#', label: 'Instagram',
    svg: <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  },
  {
    href: '#', label: 'YouTube',
    svg: <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
]

export function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Wrench className="size-5 text-accent" />
              <span>FerraTech</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Tu tienda de confianza para obtener herramientas de calidad y materiales de construcción para tu hogar.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ svg, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Acceso Rápido */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary-foreground">
              Acceso Rápido
            </h3>
            <ul className="space-y-2">
              {LINKS_ACCESO_RAPIDO.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicio al Cliente */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary-foreground">
              Servicio al Cliente
            </h3>
            <ul className="space-y-2">
              {LINKS_SERVICIO.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary-foreground">
              Newsletter
            </h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Suscríbete para obtener actualizaciones de nuevos productos y promociones especiales.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                className="w-full rounded-md bg-white/10 px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:ring-2 focus:ring-white/30 transition"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                Suscríbete
              </button>
            </form>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-primary-foreground/50 sm:flex-row">
          <span>© {new Date().getFullYear()} FerraTech. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-primary-foreground/80 transition-colors">
              Términos de Servicio
            </Link>
            <Link to="/" className="hover:text-primary-foreground/80 transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
