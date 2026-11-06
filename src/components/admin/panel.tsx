/**
 * Piezas comunes de las pantallas del panel (INI-009): el mismo encabezado, filtros, etiquetas de
 * estado y los estados de carga, vacío y error en todas. Así cada pantalla se lee igual.
 */
import type { ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function EncabezadoPanel({ titulo, descripcion, acciones }: { titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  )
}

export interface OpcionFiltro<T extends string> {
  valor: T
  texto: string
  total?: number
}

/** Fila de botones para filtrar (por estado, por ejemplo). Se desplaza a lo ancho en el celular. */
export function FiltroChips<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: OpcionFiltro<T>[]
  valor: T
  onCambio: (v: T) => void
  etiqueta: string
}) {
  return (
    <div role="group" aria-label={etiqueta} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {opciones.map((o) => {
        const activo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambio(o.valor)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted',
            )}
          >
            {o.texto}
            {o.total !== undefined && (
              <span className={cn('rounded-full px-1.5 text-xs tabular-nums', activo ? 'bg-white/20' : 'bg-muted text-muted-foreground')}>{o.total}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export type Tono = 'nuevo' | 'proceso' | 'exito' | 'perdido' | 'neutro'

const TONOS: Record<Tono, string> = {
  nuevo: 'bg-amber-100 text-amber-900',
  proceso: 'bg-sky-100 text-sky-900',
  exito: 'bg-emerald-100 text-emerald-900',
  perdido: 'bg-rose-100 text-rose-900',
  neutro: 'bg-muted text-foreground',
}

export function EtiquetaEstado({ texto, tono }: { texto: string; tono: Tono }) {
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', TONOS[tono])}>{texto}</span>
}

export function CargandoFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function EstadoVacio({ icono: Icono, titulo, texto, accion }: { icono: React.ElementType; titulo: string; texto?: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <Icono className="size-9 text-muted-foreground/50" aria-hidden />
      <p className="font-medium">{titulo}</p>
      {texto && <p className="max-w-sm text-sm text-muted-foreground">{texto}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  )
}

export function EstadoError({ texto, onReintentar }: { texto: string; onReintentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        {texto}
      </p>
      {onReintentar && (
        <Button size="sm" variant="outline" onClick={onReintentar}>
          <RotateCw className="size-3.5" /> Reintentar
        </Button>
      )}
    </div>
  )
}

/** Contenedor de tabla con borde y fondo de tarjeta; se desplaza a lo ancho si no cabe. */
export function MarcoTabla({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border bg-card">{children}</div>
}
