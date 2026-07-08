import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Menu, Search, ShoppingCart, User, Wrench, LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCarritoStore } from '@/store/carritoStore'
import { useAuthStore } from '@/stores/authStore'

const NAV_LINKS = [
  { label: 'Inicio',               href: '/',                    end: true,  ofertaOnly: false },
  { label: 'Productos',            href: '/productos',           end: true,  ofertaOnly: false },
  { label: 'Categorías',           href: '/categorias',          end: false, ofertaOnly: false },
  { label: 'Ofertas',              href: '/productos?oferta=true', end: true, ofertaOnly: true  },
  { label: 'Preguntas Frecuentes', href: '/preguntas-frecuentes', end: true, ofertaOnly: false },
]

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Selector reactivo: se actualiza cuando items cambia (incluye clearCart)
  const cartCount = useCarritoStore((s) =>
    s.items.reduce((sum, i) => sum + i.cantidad, 0)
  )
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      {/* Barra principal */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Botón hamburguesa — solo móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="flex sm:hidden shrink-0 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          aria-label="Abrir menú"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-bold text-lg tracking-wide"
        >
          <Wrench className="size-5 text-accent" />
          <span className="hidden sm:inline">FerraTech</span>
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
            placeholder="Buscar productos..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0"
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
          {/* Notificaciones — oculto en móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
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

          {/* Admin o Iniciar Sesión — oculto en móvil */}
          {isAuthenticated() ? (
            <Button
              asChild
              variant="ghost"
              className="hidden sm:flex items-center gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-2"
            >
              <Link to="/admin/productos">
                <LayoutDashboard className="size-4" />
                <span className="text-xs font-medium">Admin</span>
              </Link>
            </Button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Barra de navegación secundaria — solo desktop */}
      <nav className="hidden sm:block border-t border-white/10">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 scrollbar-none">
          {NAV_LINKS.map((link) => (
            <li key={link.label} className="shrink-0">
              <NavLink
                to={link.href}
                end={link.end}
                className={({ isActive }) => {
                  // Ofertas solo se activa si también está el query param oferta=true
                  const active = link.ofertaOnly
                    ? isActive && new URLSearchParams(location.search).get('oferta') === 'true'
                    : isActive
                  return `block px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-primary-foreground/80 hover:text-primary-foreground'
                  }`
                }}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menú móvil — Sheet lateral izquierdo */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="sm:hidden">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              FerraTech
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.href}
                    end={link.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => {
                      const active = link.ofertaOnly
                        ? isActive && new URLSearchParams(location.search).get('oferta') === 'true'
                        : isActive
                      return `flex items-center px-5 py-3 text-sm font-medium transition-colors border-l-2 ${
                        active
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-foreground hover:bg-muted hover:border-muted-foreground/30'
                      }`
                    }}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t p-4">
            {isAuthenticated() ? (
              <Button asChild variant="outline" className="w-full gap-2" size="sm">
                <Link to="/admin/productos" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="size-4" />
                  Panel Admin
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full gap-2" size="sm">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <User className="size-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
