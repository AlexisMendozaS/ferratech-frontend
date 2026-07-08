import { useEffect, useState } from 'react'
import { ChevronDown, FileText, Loader2, Phone, X } from 'lucide-react'

const fmtFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  )

const fmtFechaHora = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  actualizarEstado,
  listarCotizaciones,
  type CotizacionResponse,
  type EstadoCotizacion,
} from '@/services/cotizaciones'

// ─────────────────────────────────────────────────────────────────────────────
// Estado config
// ─────────────────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<
  EstadoCotizacion,
  { label: string; color: string; next: EstadoCotizacion[] }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    next: ['contactado', 'perdida'],
  },
  contactado: {
    label: 'Contactado',
    color: 'bg-blue-100 text-blue-800',
    next: ['cerrada', 'perdida'],
  },
  cerrada: {
    label: 'Cerrada',
    color: 'bg-green-100 text-green-800',
    next: [],
  },
  perdida: {
    label: 'Perdida',
    color: 'bg-red-100 text-red-800',
    next: [],
  },
}

const FILTROS: { label: string; value: EstadoCotizacion | 'todas' }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Contactadas', value: 'contactado' },
  { label: 'Cerradas', value: 'cerrada' },
  { label: 'Perdidas', value: 'perdida' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Estado badge
// ─────────────────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  const cfg = ESTADO_CONFIG[estado]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal de detalle
// ─────────────────────────────────────────────────────────────────────────────

function DetalleCotizacion({
  cotizacion,
  onClose,
  onEstadoChange,
}: {
  cotizacion: CotizacionResponse
  onClose: () => void
  onEstadoChange: (id: string, estado: EstadoCotizacion) => void
}) {
  const [loading, setLoading] = useState(false)
  const cfg = ESTADO_CONFIG[cotizacion.estado]

  const handleEstado = async (nuevoEstado: EstadoCotizacion) => {
    setLoading(true)
    try {
      await actualizarEstado(cotizacion.id, nuevoEstado)
      onEstadoChange(cotizacion.id, nuevoEstado)
      toast.success(`Estado actualizado a "${ESTADO_CONFIG[nuevoEstado].label}"`)
    } catch {
      toast.error('No se pudo actualizar el estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-card border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground">{cotizacion.cliente.nombre}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fmtFechaHora(cotizacion.fecha)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Datos del cliente */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cliente</p>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{cotizacion.cliente.telefono}</span></p>
              <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{cotizacion.cliente.email}</span></p>
              {cotizacion.cliente.notas && (
                <p><span className="text-muted-foreground">Notas:</span> {cotizacion.cliente.notas}</p>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Productos ({cotizacion.detalle.length})
            </p>
            <ul className="space-y-1.5">
              {cotizacion.detalle.map((item, i) => (
                <li key={i} className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.nombre_producto}</p>
                    {item.variante_seleccionada && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variante_seleccionada}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-muted-foreground">×{item.cantidad}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: estado + acciones */}
        <div className="border-t px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado actual:</span>
            <EstadoBadge estado={cotizacion.estado} />
          </div>

          {cfg.next.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cfg.next.map((estado) => (
                <Button
                  key={estado}
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleEstado(estado)}
                >
                  {loading && <Loader2 className="size-3 animate-spin mr-1" />}
                  Marcar como {ESTADO_CONFIG[estado].label}
                </Button>
              ))}
            </div>
          )}

          <a
            href={`tel:${cotizacion.cliente.telefono}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="size-3.5" />
            Llamar a {cotizacion.cliente.nombre}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<EstadoCotizacion | 'todas'>('todas')
  const [seleccionada, setSeleccionada] = useState<CotizacionResponse | null>(null)

  useEffect(() => {
    listarCotizaciones()
      .then(setCotizaciones)
      .catch(() => toast.error('No se pudieron cargar las cotizaciones'))
      .finally(() => setLoading(false))
  }, [])

  const handleEstadoChange = (id: string, nuevoEstado: EstadoCotizacion) => {
    setCotizaciones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
    )
    if (seleccionada?.id === id) {
      setSeleccionada((prev) => (prev ? { ...prev, estado: nuevoEstado } : null))
    }
  }

  const filtradas =
    filtro === 'todas' ? cotizaciones : cotizaciones.filter((c) => c.estado === filtro)

  const counts = {
    todas: cotizaciones.length,
    pendiente: cotizaciones.filter((c) => c.estado === 'pendiente').length,
    contactado: cotizaciones.filter((c) => c.estado === 'contactado').length,
    cerrada: cotizaciones.filter((c) => c.estado === 'cerrada').length,
    perdida: cotizaciones.filter((c) => c.estado === 'perdida').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cotizaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las solicitudes de cotización recibidas.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filtro === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label}
            <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-xs">
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <FileText className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {filtro === 'todas' ? 'No hay cotizaciones aún.' : `No hay cotizaciones con estado "${ESTADO_CONFIG[filtro]?.label}".`}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Productos</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtradas.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSeleccionada(c)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.cliente.telefono}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {c.detalle.length} producto{c.detalle.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {fmtFecha(c.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={c.estado} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronDown className="size-4 text-muted-foreground -rotate-90" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      {seleccionada && (
        <DetalleCotizacion
          cotizacion={seleccionada}
          onClose={() => setSeleccionada(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </div>
  )
}
