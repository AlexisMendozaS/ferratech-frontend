/**
 * Contactos (INI-009): personas que dejaron sus datos en el sitio sin enviar una cotización
 * (pestaña lateral, ventana emergente, WhatsApp). Se les da seguimiento hasta cerrarlos.
 */
import { useEffect, useState } from 'react'
import { ChevronRight, Loader2, Mail, MessageCircle, Phone, Search, Trash2, Users } from 'lucide-react'
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
import { Seleccion } from '@/components/admin/producto/campos'
import { numeroWhatsApp } from '@/lib/contacto'
import { actualizarEstadoLead, eliminarLead, listarLeads, type EstadoLead, type LeadResponse } from '@/services/leads'

const ESTADO: Record<EstadoLead, { texto: string; tono: Tono; siguientes: EstadoLead[] }> = {
  nuevo: { texto: 'Nuevo', tono: 'nuevo', siguientes: ['contactado'] },
  contactado: { texto: 'Contactado', tono: 'proceso', siguientes: ['cerrado'] },
  cerrado: { texto: 'Cerrado', tono: 'exito', siguientes: [] },
}

const ORIGEN: Record<string, string> = {
  popup: 'Ventana emergente',
  whatsapp: 'WhatsApp',
  widget_lateral: 'Pestaña «Contacto»',
  footer_newsletter: 'Boletín',
  busqueda: 'Búsqueda sin resultado',
}

type Filtro = EstadoLead | 'todos'

function DetalleContacto({
  contacto,
  onCerrar,
  onCambio,
  onBorrado,
}: {
  contacto: LeadResponse
  onCerrar: () => void
  onCambio: (c: LeadResponse) => void
  onBorrado: (id: string) => void
}) {
  const [guardando, setGuardando] = useState(false)
  const estado = ESTADO[contacto.estado]
  const whatsapp = numeroWhatsApp(contacto.telefono)

  const cambiarEstado = async (nuevo: EstadoLead) => {
    setGuardando(true)
    try {
      onCambio(await actualizarEstadoLead(contacto.id, nuevo))
      toast.success(`Marcado como «${ESTADO[nuevo].texto}»`)
    } catch {
      toast.error('No se pudo actualizar el estado')
    } finally {
      setGuardando(false)
    }
  }

  const borrar = async () => {
    try {
      await eliminarLead(contacto.id)
      onBorrado(contacto.id)
      toast.success('Contacto borrado')
    } catch {
      toast.error('No se pudo borrar el contacto')
    }
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {contacto.nombre} <EtiquetaEstado texto={estado.texto} tono={estado.tono} />
          </DialogTitle>
          <DialogDescription>
            Llegó por {ORIGEN[contacto.origen] ?? contacto.origen} el {fmtFechaHora(contacto.fecha)}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd className="font-medium">{contacto.telefono}</dd>
          <dt className="text-muted-foreground">Correo</dt>
          <dd className="break-all font-medium">{contacto.email || '—'}</dd>
          {contacto.notas && (
            <>
              <dt className="text-muted-foreground">Notas</dt>
              <dd>{contacto.notas}</dd>
            </>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          {whatsapp && (
            <Button asChild size="sm" className="bg-[#1f8f4e] text-white hover:bg-[#1a7a43]">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <a href={`tel:${contacto.telefono}`}>
              <Phone className="size-3.5" /> Llamar
            </a>
          </Button>
          {contacto.email && (
            <Button asChild size="sm" variant="outline">
              <a href={`mailto:${contacto.email}`}>
                <Mail className="size-3.5" /> Correo
              </a>
            </Button>
          )}
        </div>

        <section className="space-y-3 border-t pt-4">
          {estado.siguientes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {estado.siguientes.map((s) => (
                <Button key={s} size="sm" disabled={guardando} onClick={() => cambiarEstado(s)}>
                  {guardando && <Loader2 className="size-3 animate-spin" />}
                  Marcar como {ESTADO[s].texto.toLowerCase()}
                </Button>
              ))}
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
                <AlertDialogTitle>¿Borrar el contacto {contacto.nombre}?</AlertDialogTitle>
                <AlertDialogDescription>Se borra para siempre y deja de contar en el resumen. Úsalo solo para spam o pruebas.</AlertDialogDescription>
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

export default function AdminLeadsPage() {
  const [contactos, setContactos] = useState<LeadResponse[] | null>(null)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [origen, setOrigen] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<LeadResponse | null>(null)

  useEffect(() => {
    let vigente = true
    listarLeads().then(
      (lista) => {
        if (!vigente) return
        setContactos(lista)
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

  const actualizar = (c: LeadResponse) => {
    setContactos((prev) => prev?.map((x) => (x.id === c.id ? c : x)) ?? prev)
    setSeleccionado(c)
  }

  const quitar = (id: string) => {
    setContactos((prev) => prev?.filter((x) => x.id !== id) ?? prev)
    setSeleccionado(null)
  }

  const lista = contactos ?? []
  const texto = busqueda.trim().toLowerCase()
  const visibles = lista.filter(
    (c) =>
      (filtro === 'todos' || c.estado === filtro) &&
      (origen === 'todos' || c.origen === origen) &&
      (!texto || [c.nombre, c.telefono, c.email].some((campo) => campo?.toLowerCase().includes(texto))),
  )
  const total = (e: EstadoLead) => lista.filter((c) => c.estado === e).length
  const origenes = [...new Set(lista.map((c) => c.origen))]

  return (
    <div className="space-y-5">
      <EncabezadoPanel
        titulo="Contactos"
        descripcion="Personas que dejaron sus datos en el sitio sin enviar cotización. Escríbeles para convertirlas en venta."
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FiltroChips
          etiqueta="Filtrar por estado"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: 'todos', texto: 'Todos', total: lista.length },
            { valor: 'nuevo', texto: 'Nuevos', total: total('nuevo') },
            { valor: 'contactado', texto: 'Contactados', total: total('contactado') },
            { valor: 'cerrado', texto: 'Cerrados', total: total('cerrado') },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Seleccion aria-label="Filtrar por origen" value={origen} onChange={(e) => setOrigen(e.target.value)} className="bg-card sm:w-48">
            <option value="todos">Todos los orígenes</option>
            {origenes.map((o) => (
              <option key={o} value={o}>
                {ORIGEN[o] ?? o}
              </option>
            ))}
          </Seleccion>
          <label className="relative sm:w-64">
            <span className="sr-only">Buscar contactos</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, teléfono o correo" className="bg-card pl-9" />
          </label>
        </div>
      </div>

      {error ? (
        <EstadoError texto="No se pudieron cargar los contactos. Revisa la conexión con el servidor." onReintentar={reintentar} />
      ) : !contactos ? (
        <CargandoFilas />
      ) : visibles.length === 0 ? (
        <EstadoVacio
          icono={Users}
          titulo={lista.length === 0 ? 'Todavía no hay contactos' : 'Nada con estos filtros'}
          texto={lista.length === 0 ? 'Cuando alguien deje sus datos en la pestaña «Contacto» del sitio aparecerá aquí.' : 'Prueba con otro estado u origen, o borra la búsqueda.'}
        />
      ) : (
        <MarcoTabla>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Llegó por</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Fecha</th>
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
                  <tr key={c.id} className="cursor-pointer transition-colors hover:bg-muted/40" onClick={() => setSeleccionado(c)}>
                    <td className="px-4 py-3">
                      <button type="button" className="text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none" onClick={() => setSeleccionado(c)}>
                        {c.nombre}
                      </button>
                      <p className="text-xs text-muted-foreground">{c.telefono}</p>
                      {c.notas && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.notas}</p>}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{ORIGEN[c.origen] ?? c.origen}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                      {fmtFecha(c.fecha)}
                      {c.estado === 'nuevo' && <p className="text-xs font-medium text-amber-800">{haceCuanto(c.fecha)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <EtiquetaEstado texto={estado.texto} tono={estado.tono} />
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

      {seleccionado && <DetalleContacto key={seleccionado.id} contacto={seleccionado} onCerrar={() => setSeleccionado(null)} onCambio={actualizar} onBorrado={quitar} />}
    </div>
  )
}
