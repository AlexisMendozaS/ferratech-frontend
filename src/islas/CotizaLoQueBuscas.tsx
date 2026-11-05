/**
 * «Cotiza lo que buscas» (INI-006): cuando una búsqueda no tiene coincidencias, el cliente deja
 * sus datos y lo que necesita; el vendedor lo consigue. Crea un contacto con origen «busqueda».
 */
import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'

import { leadsService } from '@/services/leads'

interface Props {
  busqueda: string
}

export default function CotizaLoQueBuscas({ busqueda }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [detalle, setDetalle] = useState(busqueda)
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'enviado' | 'error'>('listo')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim()) return
    setEstado('enviando')
    try {
      await leadsService.crear({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        origen: 'busqueda',
        notas: `Busca: ${detalle.trim() || busqueda}`,
      })
      setEstado('enviado')
    } catch {
      setEstado('error')
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          Gracias, {nombre.trim().split(' ')[0]}. Un asesor te contactará para cotizar <strong>{detalle || busqueda}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="font-semibold">¿No es lo que buscabas? Te lo conseguimos.</p>
        <p className="text-sm text-muted-foreground">Déjanos tus datos y cotizamos «{busqueda}» sin costo.</p>
      </div>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">¿Qué necesitas?</span>
        <input
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          maxLength={200}
          className="rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Nombre</span>
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
          className="rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Teléfono o WhatsApp</span>
        <input
          required
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          className="rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
        />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 font-semibold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-60"
        >
          <Send className="size-4" aria-hidden />
          {estado === 'enviando' ? 'Enviando…' : 'Quiero que me coticen'}
        </button>
        {estado === 'error' && <p className="text-sm text-destructive">No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.</p>}
      </div>
    </form>
  )
}
