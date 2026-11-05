import { useEffect, useState } from 'react'
import { ChevronDown, Loader2, Phone, Users, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  actualizarEstadoLead,
  listarLeads,
  type EstadoLead,
  type LeadResponse,
} from '@/services/leads'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de fecha
// ─────────────────────────────────────────────────────────────────────────────

const fmtFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  )

const fmtFechaHora = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))

// ─────────────────────────────────────────────────────────────────────────────
// Config de estados y orígenes
// ─────────────────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoLead, { label: string; color: string; next: EstadoLead[] }> = {
  nuevo: {
    label: 'Nuevo',
    color: 'bg-blue-100 text-blue-800',
    next: ['contactado'],
  },
  contactado: {
    label: 'Contactado',
    color: 'bg-yellow-100 text-yellow-800',
    next: ['cerrado'],
  },
  cerrado: {
    label: 'Cerrado',
    color: 'bg-green-100 text-green-800',
    next: [],
  },
}

const ORIGEN_LABELS: Record<string, string> = {
  popup: 'Pop-up',
  whatsapp: 'WhatsApp',
  widget_lateral: 'Widget lateral',
  footer_newsletter: 'Newsletter',
}

const FILTROS_ESTADO: { label: string; value: EstadoLead | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Nuevos', value: 'nuevo' },
  { label: 'Contactados', value: 'contactado' },
  { label: 'Cerrados', value: 'cerrado' },
]

const ORIGENES_DISPONIBLES = ['popup', 'whatsapp', 'widget_lateral', 'footer_newsletter']

// ─────────────────────────────────────────────────────────────────────────────
// Badge de estado
// ─────────────────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoLead }) {
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

function DetalleLead({
  lead,
  onClose,
  onEstadoChange,
}: {
  lead: LeadResponse
  onClose: () => void
  onEstadoChange: (id: string, estado: EstadoLead) => void
}) {
  const [loading, setLoading] = useState(false)
  const cfg = ESTADO_CONFIG[lead.estado]

  const handleEstado = async (nuevoEstado: EstadoLead) => {
    setLoading(true)
    try {
      await actualizarEstadoLead(lead.id, nuevoEstado)
      onEstadoChange(lead.id, nuevoEstado)
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
      <div className="relative z-10 w-full max-w-md rounded-xl bg-card border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <p className="font-semibold text-foreground">{lead.nombre}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{fmtFechaHora(lead.fecha)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Datos */}
        <div className="p-5 space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{lead.telefono}</span></p>
            <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{lead.email || '—'}</span></p>
            <p><span className="text-muted-foreground">Origen:</span> <span className="font-medium">{ORIGEN_LABELS[lead.origen] ?? lead.origen}</span></p>
            {lead.notas && (
              <p><span className="text-muted-foreground">Notas:</span> {lead.notas}</p>
            )}
          </div>
        </div>

        {/* Footer: estado + acciones */}
        <div className="border-t px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <EstadoBadge estado={lead.estado} />
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
            href={`tel:${lead.telefono}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="size-3.5" />
            Llamar a {lead.nombre}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<EstadoLead | 'todos'>('todos')
  const [filtroOrigen, setFiltroOrigen] = useState<string>('todos')
  const [seleccionado, setSeleccionado] = useState<LeadResponse | null>(null)

  useEffect(() => {
    listarLeads()
      .then(setLeads)
      .catch(() => toast.error('No se pudieron cargar los leads'))
      .finally(() => setLoading(false))
  }, [])

  const handleEstadoChange = (id: string, nuevoEstado: EstadoLead) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado: nuevoEstado } : l)))
    if (seleccionado?.id === id) {
      setSeleccionado((prev) => (prev ? { ...prev, estado: nuevoEstado } : null))
    }
  }

  const filtrados = leads.filter((l) => {
    const matchEstado = filtroEstado === 'todos' || l.estado === filtroEstado
    const matchOrigen = filtroOrigen === 'todos' || l.origen === filtroOrigen
    return matchEstado && matchOrigen
  })

  const counts = {
    todos: leads.length,
    nuevo: leads.filter((l) => l.estado === 'nuevo').length,
    contactado: leads.filter((l) => l.estado === 'contactado').length,
    cerrado: leads.filter((l) => l.estado === 'cerrado').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Contactos capturados a través del sitio.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Por estado */}
        <div className="flex flex-wrap gap-2">
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltroEstado(f.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                filtroEstado === f.value
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

        {/* Por origen */}
        <select
          value={filtroOrigen}
          onChange={(e) => setFiltroOrigen(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="todos">Todos los orígenes</option>
          {ORIGENES_DISPONIBLES.map((o) => (
            <option key={o} value={o}>{ORIGEN_LABELS[o] ?? o}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Users className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay leads con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contacto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Origen</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtrados.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSeleccionado(lead)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{lead.nombre}</p>
                    <p className="text-xs text-muted-foreground">{lead.telefono}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    {ORIGEN_LABELS[lead.origen] ?? lead.origen}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {fmtFecha(lead.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={lead.estado} />
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
      {seleccionado && (
        <DetalleLead
          lead={seleccionado}
          onClose={() => setSeleccionado(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </div>
  )
}
