import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Tag,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStats } from '@/hooks/useAdminStats'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toaster } from 'sonner'

// ─────────────────────────────────────────────────────────────────────────────
// Nav structure
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  end: boolean
  badgeKey?: 'cotizaciones_pendientes' | 'leads_nuevos'
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Resumen', href: '/admin/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      {
        label: 'Cotizaciones',
        href: '/admin/cotizaciones',
        icon: FileText,
        end: false,
        badgeKey: 'cotizaciones_pendientes',
      },
      {
        label: 'Leads',
        href: '/admin/leads',
        icon: Users,
        end: false,
        badgeKey: 'leads_nuevos',
      },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Productos', href: '/admin/productos', icon: Package, end: false },
      { label: 'Categorías', href: '/admin/categorias', icon: Tag, end: false },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-accent-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar content
// ─────────────────────────────────────────────────────────────────────────────

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const clearToken = useAuthStore((s) => s.clearToken)
  const navigate = useNavigate()
  const stats = useAdminStats()

  const handleLogout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 font-bold text-lg tracking-wide text-primary-foreground">
        <Wrench className="size-5 text-accent" />
        <span>FerraTech</span>
        <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
          Admin
        </span>
      </div>

      <Separator className="bg-white/10" />

      {/* Nav por secciones */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const badgeCount =
                  item.badgeKey && stats ? stats[item.badgeKey] : 0

                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.end}
                      onClick={onNav}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-accent/20 text-accent'
                            : 'text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground'
                        }`
                      }
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                      <Badge count={badgeCount} />
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Separator className="bg-white/10" />

      {/* Footer: ir a tienda + logout */}
      <div className="p-3 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-primary-foreground/50 hover:bg-white/10 hover:text-primary-foreground transition-colors"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Ir a la tienda
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-primary-foreground/50 hover:bg-white/10 hover:text-primary-foreground transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-56 shrink-0 flex-col bg-primary lg:flex">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-56 flex-col bg-primary shadow-xl">
            <button
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="size-8"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2 font-bold text-base tracking-wide text-foreground">
            <Wrench className="size-4 text-accent" />
            <span>FerraTech</span>
            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent">
              Admin
            </span>
          </div>
        </header>

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  )
}
