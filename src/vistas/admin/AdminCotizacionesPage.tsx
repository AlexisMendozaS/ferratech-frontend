/**
 * Cotizaciones (INI-009): lo que pidió cada cliente, en qué estado va y qué falta hacer. Se busca por
 * nombre, teléfono o correo; se ve el producto, el estado de la obra y cuánto lleva esperando.
 */
import { useEffect, useState } from 'react'
import { ChevronRight, FileText, Loader2, Mail, MessageCircle, Phone, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  CargandoFilas,
  EncabezadoPanel,
  EstadoError,
  EstadoVacio,
  EtiquetaEstado,
  FiltroChips,
  MarcoTabla,
  type Tono,
} from '@/components/admin/panel'
import { fmtFecha, fmtFechaHora, haceCuanto } from '@/lib/fechas'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { numeroWhatsApp } from '@/lib/contacto'
import {
  actualizarEstado,
  actualizarMonto,
  eliminarCotizacion,
  listarCotizaciones,
  type CotizacionResponse,
  type EstadoCotizacion,
} from '@/services/cotizaciones'

const ESTADO: Record<EstadoCotizacion, { texto: string; tono: Tono; siguientes: EstadoCotizacion[] }> = {
  pendiente: { texto: 'Nueva', tono: 'nuevo', siguientes: ['contactado', 'perdida'] },
  contactado: { texto: 'Respondida', tono: 'proceso', siguientes: ['cerrada', 'perdida'] },
  cerrada: { texto: 'Ganada', tono: 'exito', siguientes: [] },
  perdida: { texto: 'Perdida', tono: 'perdido', siguientes: [] },
}

type Filtro = EstadoCotizacion | 'todas'

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

function resumenProductos(c: CotizacionResponse): string {
  const [primero, ...resto] = c.detalle
  if (!primero) return '—'
  return resto.length ? `${primero.nombre_producto} y ${resto.length} más` : primero.nombre_producto
}

function enlaceWhatsApp(telefono: string): string | null {
  const numero = numeroWhatsApp(telefono)
  return numero ? `https://wa.me/${numero}` : null
}

// ─────────────────────────────────────────────────────────────────────────────

function DetalleCotizacion({
  cotizacion,
  onCerrar,
  onCambio,
  onBorrada,
}: {
  cotizacion: CotizacionResponse
  onCerrar: () => void
  onCambio: (c: CotizacionResponse) => void
  onBorrada: (id: string) => void
}) {
  const [guardando, setGuardando] = useState(false)
  const [monto, setMonto] = useState(cotizacion.monto?.toString() ?? '')
  const estado = ESTADO[cotizacion.estado]
  const whatsapp = enlaceWhatsApp(cotizacion.cliente.telefono)

  const cambiarEstado = async (nuevo: EstadoCotizacion) => {
    setGuardando(true)
    try {
      onCambio(await actualizarEstado(cotizacion.id, nuevo))
      toast.success(`Marcada como «${ESTADO[nuevo].texto}»`)
    } catch {
      toast.error('No se pudo actualizar el estado')
    } finally {
      setGuardando(false)
    }
  }

  const guardarMonto = async () => {
    const valor = Number(monto)
    if (!monto.trim() || Number.isNaN(valor) || valor < 0) {
      toast.error('Escribe un monto válido')
      return
    }
    try {
      onCambio(await actualizarMonto(cotizacion.id, valor))
      toast.success('Monto guardado')
    } catch {
      toast.error('No se pudo guardar el monto')
    }
  }

  const borrar = async () => {
    try {
      await eliminarCotizacion(cotizacion.id)
      onBorrada(cotizacion.id)
      toast.success('Cotización borrada')
    } catch {
      toast.error('No se pudo borrar la cotización')
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {cotizacion.cliente.nombre} <EtiquetaEstado texto={estado.texto} tono={estado.tono} />
          </DialogTitle>
          <DialogDescription>Recibida el {fmtFechaHora(cotizacion.fecha)}</DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
            <dt className="text-muted-foreground">Teléfono</dt>
            <dd className="font-medium">{cotizacion.cliente.telefono}</dd>
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="break-all font-medium">{cotizacion.cliente.email}</dd>
            <dt className="text-muted-foreground">Obra en</dt>
            <dd className="font-medium">{cotizacion.cliente.estado_republica ?? 'No lo indicó'}</dd>
            {cotizacion.cliente.notas && (
              <>
                <dt className="text-muted-foreground">Notas</dt>
                <dd>{cotizacion.cliente.notas}</dd>
              </>
            )}
          </dl>
          <div className="flex flex-wrap gap-2">
            {whatsapp && (
              <Button asChild size="sm" className="bg-[#1f8f4e] text-white hover:bg-[#1a7a43]">
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <a href={`tel:${cotizacion.cliente.telefono}`}>
                <Phone className="size-3.5" /> Llamar
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={`mailto:${cotizacion.cliente.email}?subject=${encodeURIComponent('Tu cotización en FerraTech')}`}>
                <Mail className="size-3.5" /> Correo
              </a>
            </Button>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos ({cotizacion.detalle.length})</h3>
          <ul className="space-y-1.5">
            {cotizacion.detalle.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{item.nombre_producto}</p>
                  {item.variante_seleccionada && <p className="mt-0.5 text-xs text-muted-foreground">{item.variante_seleccionada}</p>}
                </div>
                <span className="shrink-0 tabular-nums text-muted-foreground">×{item.cantidad}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 border-t pt-4">
          {estado.siguientes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {estado.siguientes.map((s) => (
                <Button key={s} size="sm" variant={s === 'perdida' ? 'outline' : 'default'} disabled={guardando} onClick={() => cambiarEstado(s)}>
                  {guardando && <Loader2 className="size-3 animate-spin" />}
                  Marcar como {ESTADO[s].texto.toLowerCase()}
                </Button>
              ))}
            </div>
          )}

          {cotizacion.estado === 'cerrada' && (
            <div className="flex items-end gap-2">
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Monto de la venta (MXN, interno)</span>
                <Input type="number" min={0} step="0.01" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} className="w-40" />
              </label>
              <Button size="sm" variant="outline" onClick={guardarMonto}>
                Guardar
              </Button>
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3.5" /> Borrar (spam o prueba)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Borrar la cotización de {cotizacion.cliente.nombre}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Úsalo solo para spam o pruebas: se borra para siempre y deja de contar en el resumen. Si el cliente no compró, márcala
                  como <strong>perdida</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={borrar}>
                  Borrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionResponse[] | null>(null)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionada, setSeleccionada] = useState<CotizacionResponse | null>(null)

  useEffect(() => {
    let vigente = true
    listarCotizaciones().then(
      (lista) => {
        if (!vigente) return
        setCotizaciones(lista)
        setError(false)
      },
      () => vigente && setError(true),
    )
    return () => {
      vigente = false
    }
  }, [intento])

  const reintentar = () => {
    setError(false)
    setIntento((n) => n + 1)
  }

  const actualizar = (c: CotizacionResponse) => {
    setCotizaciones((prev) => prev?.map((x) => (x.id === c.id ? c : x)) ?? prev)
    setSeleccionada(c)
  }

  const quitar = (id: string) => {
    setCotizaciones((prev) => prev?.filter((x) => x.id !== id) ?? prev)
    setSeleccionada(null)
  }

  const lista = cotizaciones ?? []
  const texto = busqueda.trim().toLowerCase()
  const visibles = lista.filter(
    (c) =>
      (filtro === 'todas' || c.estado === filtro) &&
      (!texto || [c.cliente.nombre, c.cliente.telefono, c.cliente.email].some((campo) => campo?.toLowerCase().includes(texto))),
  )
  const total = (e: EstadoCotizacion) => lista.filter((c) => c.estado === e).length
  const pendientes = total('pendiente')

  return (
    <div className="space-y-5">
      <EncabezadoPanel
        titulo="Cotizaciones"
        descripcion={
          cotizaciones
            ? pendientes
              ? `${pendientes} por responder. Responder rápido es lo que más ayuda a cerrar la venta.`
              : 'Todas respondidas. 👍'
            : 'Lo que pidió cada cliente y en qué estado va.'
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FiltroChips
          etiqueta="Filtrar por estado"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: 'todas', texto: 'Todas', total: lista.length },
            { valor: 'pendiente', texto: 'Nuevas', total: pendientes },
            { valor: 'contactado', texto: 'Respondidas', total: total('contactado') },
            { valor: 'cerrada', texto: 'Ganadas', total: total('cerrada') },
            { valor: 'perdida', texto: 'Perdidas', total: total('perdida') },
          ]}
        />
        <label className="relative md:w-72">
          <span className="sr-only">Buscar cotizaciones</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, teléfono o correo" className="bg-card pl-9" />
        </label>
      </div>

      {error ? (
        <EstadoError texto="No se pudieron cargar las cotizaciones. Revisa la conexión con el servidor." onReintentar={reintentar} />
      ) : !cotizaciones ? (
        <CargandoFilas />
      ) : visibles.length === 0 ? (
        <EstadoVacio
          icono={FileText}
          titulo={lista.length === 0 ? 'Todavía no llegan cotizaciones' : 'Nada con estos filtros'}
          texto={lista.length === 0 ? 'Cuando un cliente envíe su cotización desde el sitio aparecerá aquí y te llegará un correo.' : 'Prueba con otro estado o borra la búsqueda.'}
        />
      ) : (
        <MarcoTabla>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Pidió</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Obra en</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Recibida</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="w-8 px-2 py-3">
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibles.map((c) => {
                const estado = ESTADO[c.estado]
                return (
                  <tr key={c.id} className="cursor-pointer transition-colors hover:bg-muted/40" onClick={() => setSeleccionada(c)}>
                    <td className="px-4 py-3">
                      <button type="button" className="text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none" onClick={() => setSeleccionada(c)}>
                        {c.cliente.nombre}
                      </button>
                      <p className="text-xs text-muted-foreground">{c.cliente.telefono}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">{resumenProductos(c)}</p>
                    </td>
                    <td className="hidden max-w-xs px-4 py-3 md:table-cell">
                      <p className="line-clamp-2">{resumenProductos(c)}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{c.cliente.estado_republica ?? '—'}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                      {fmtFecha(c.fecha)}
                      {c.estado === 'pendiente' && <p className="text-xs font-medium text-amber-800">{haceCuanto(c.fecha)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaEstado texto={estado.texto} tono={estado.tono} />
                      {c.estado === 'cerrada' && c.monto != null && <p className="mt-1 text-xs tabular-nums text-muted-foreground">{mxn.format(c.monto)}</p>}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </MarcoTabla>
      )}

      {seleccionada && <DetalleCotizacion key={seleccionada.id} cotizacion={seleccionada} onCerrar={() => setSeleccionada(null)} onCambio={actualizar} onBorrada={quitar} />}
    </div>
  )
}
