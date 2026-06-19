import { useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Search, ShoppingCart, User, Wrench } from 'lucide-react'

import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/productos' },
  { label: 'Categorías', href: '/productos' },
  { label: 'Ofertas', href: '/productos?oferta=true' },
  { label: 'Preguntas Frecuentes', href: '/faq' },
]

/* Cart count — se conectará a Zustand en T-20 */
const useCartCount = () => 0

export function Navbar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const cartCount = useCartCount()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      {/* Barra principal */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-bold text-lg tracking-wide"
        >
          <Wrench className="size-5 text-accent" />
          <span>FerraTech</span>
        </Link>

        {/* Buscador */}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-1 rounded-md bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-white/50 transition-shadow"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar Productos y mas..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Search className="size-4" />
          </button>
        </form>

        {/* Iconos derecha */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Notificaciones */}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="size-5" />
          </Button>

          {/* Carrito */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          >
            <Link to="/carrito" aria-label="Ver carrito">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Iniciar Sesión */}
          <Button
            asChild
            variant="ghost"
            className="hidden sm:flex items-center gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-2"
          >
            <Link to="/login">
              <User className="size-4" />
              <span className="text-xs font-medium">Iniciar Sesión</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Barra de navegación secundaria */}
      <nav className="border-t border-white/10">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href + link.label} className="shrink-0">
              <NavLink
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-primary-foreground/80 hover:text-primary-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
