import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  FolderOpen,
  Layers,
  Loader2,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'

import { useAdminStats } from '@/hooks/useAdminStats'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function StatValue({ value }: { value: number | undefined }) {
  if (value === undefined) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }
  return <span className="text-3xl font-bold text-foreground">{value}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | undefined
  sublabel?: string
  icon: React.ReactNode
  accent?: string
  onClick?: () => void
}

function KpiCard({ label, value, sublabel, icon, accent = 'bg-primary/10 text-primary', onClick }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 flex flex-col gap-4 ${onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
      </div>
      <div>
        <StatValue value={value} />
        {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick access link
// ─────────────────────────────────────────────────────────────────────────────

function QuickLink({
  label,
  description,
  icon,
  to,
}: {
  label: string
  description: string
  icon: React.ReactNode
  to: string
}) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-4 rounded-xl border bg-card p-4 text-left hover:bg-muted/30 transition-colors w-full"
    >
      <div className="rounded-lg bg-muted p-2.5 text-muted-foreground shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const stats = useAdminStats()
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vista general de la actividad.</p>
      </div>

      {/* KPIs principales */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Pendientes de atención
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Cotizaciones pendientes"
            value={stats?.cotizaciones_pendientes}
            sublabel="Sin contactar al cliente"
            icon={<ClipboardList className="size-4" />}
            accent="bg-yellow-100 text-yellow-700"
            onClick={() => navigate('/admin/cotizaciones')}
          />
          <KpiCard
            label="Leads nuevos"
            value={stats?.leads_nuevos}
            sublabel="Sin seguimiento aún"
            icon={<Users className="size-4" />}
            accent="bg-blue-100 text-blue-700"
            onClick={() => navigate('/admin/leads')}
          />
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Actividad — cotizaciones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Hoy"
            value={stats?.cotizaciones_hoy}
            icon={<TrendingUp className="size-4" />}
          />
          <KpiCard
            label="Esta semana"
            value={stats?.cotizaciones_semana}
            icon={<TrendingUp className="size-4" />}
          />
          <KpiCard
            label="Este mes"
            value={stats?.cotizaciones_mes}
            icon={<TrendingUp className="size-4" />}
          />
        </div>
      </section>

      {/* Catálogo */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Catálogo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Productos"
            value={stats?.total_productos}
            icon={<Package className="size-4" />}
            accent="bg-green-100 text-green-700"
            onClick={() => navigate('/admin/productos')}
          />
          <KpiCard
            label="Categorías"
            value={stats?.total_categorias}
            icon={<Layers className="size-4" />}
            accent="bg-purple-100 text-purple-700"
            onClick={() => navigate('/admin/categorias')}
          />
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickLink
            label="Ver cotizaciones"
            description="Gestiona y actualiza el estado de cada solicitud"
            icon={<ClipboardList className="size-4" />}
            to="/admin/cotizaciones"
          />
          <QuickLink
            label="Ver leads"
            description="Contactos capturados desde el sitio"
            icon={<Users className="size-4" />}
            to="/admin/leads"
          />
          <QuickLink
            label="Productos"
            description="Agrega, edita o desactiva productos del catálogo"
            icon={<Package className="size-4" />}
            to="/admin/productos"
          />
          <QuickLink
            label="Categorías"
            description="Organiza la estructura del catálogo"
            icon={<FolderOpen className="size-4" />}
            to="/admin/categorias"
          />
        </div>
      </section>
    </div>
  )
}
