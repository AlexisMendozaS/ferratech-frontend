/**
 * Elegir medida o presentación y agregarla a la cotización (sin precio, DEC-012).
 * Muestra los datos técnicos de la variante elegida y ofrece cotizar por WhatsApp.
 */
import { useState } from 'react'
import { Check, ClipboardPlus, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useCarritoStore } from '@/store/carritoStore'
import { describeVariante, type Eje, type VariantePublica } from '@/types/producto'

interface Props {
  id: string
  nombre: string
  imagen: string | null
  ejes: Eje[]
  variantes: VariantePublica[]
  whatsapp: string | null
}

const UNIDAD: Record<string, string> = {
  pieza: 'piezas',
  kg: 'kg',
  tonelada: 'toneladas',
  metro: 'metros',
  rollo: 'rollos',
  caja: 'cajas',
  bulto: 'bultos',
  hoja: 'hojas',
  litro: 'litros',
  juego: 'juegos',
}

export default function AgregarACotizacion({ id, nombre, imagen, ejes, variantes, whatsapp }: Props) {
  const [valores, setValores] = useState<Record<string, string>>(() => variantes[0]?.valores ?? {})
  const [cantidad, setCantidad] = useState(1)
  const agregar = useCarritoStore((s) => s.addItem)

  const variante = variantes.find((v) => ejes.every((e) => v.valores[e.nombre] === valores[e.nombre])) ?? null
  const combina = (eje: string, opcion: string) =>
    variantes.some(
      (v) => v.valores[eje] === opcion && ejes.every((e) => e.nombre === eje || v.valores[e.nombre] === valores[e.nombre]),
    )

  function elegir(eje: string, opcion: string) {
    const nuevos = { ...valores, [eje]: opcion }
    // Si la combinación no existe, se toma la primera variante con esa opción.
    const exacta = variantes.find((v) => ejes.every((e) => v.valores[e.nombre] === nuevos[e.nombre]))
    setValores(exacta ? nuevos : (variantes.find((v) => v.valores[eje] === opcion)?.valores ?? nuevos))
  }

  const descripcion = variante ? describeVariante(variante.valores) : ''
  const unidad = variante ? (UNIDAD[variante.unidad_venta] ?? variante.unidad_venta) : ''

  function alAgregar() {
    if (!variante) return
    agregar({
      id_producto: id,
      nombre,
      imagen,
      variante_seleccionada: descripcion || null,
      sku: variante.sku,
      unidad_venta: variante.unidad_venta,
      cantidad,
    })
    toast.success('Agregado a tu cotización', {
      description: [nombre, descripcion].filter(Boolean).join(' · '),
      action: { label: 'Ver cotización', onClick: () => window.location.assign('/cotizacion') },
    })
  }

  const mensaje = encodeURIComponent(
    `Hola, quiero cotizar: ${nombre}${descripcion ? ` (${descripcion})` : ''}, ${cantidad} ${unidad}.`,
  )

  return (
    <div className="space-y-5">
      {ejes.map((eje) => (
        <fieldset key={eje.nombre}>
          <legend className="mb-2 text-sm font-semibold">{eje.nombre}</legend>
          <div className="flex flex-wrap gap-2">
            {eje.opciones.map((op) => {
              const elegida = valores[eje.nombre] === op
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => elegir(eje.nombre, op)}
                  aria-pressed={elegida}
                  className={cn(
                    'min-w-11 rounded-md border px-3 py-1.5 text-sm transition-colors',
                    elegida ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/60',
                    !elegida && !combina(eje.nombre, op) && 'border-dashed text-muted-foreground',
                  )}
                >
                  {op}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      {variante && variante.especificaciones.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md bg-muted/60 p-3 text-sm">
          {variante.especificaciones.map((f, i) => (
            <div key={i} className="contents">
              <dt className="text-muted-foreground">{f.clave}</dt>
              <dd className="font-medium">
                {f.valor}
                {f.unidad ? ` ${f.unidad}` : ''}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div>
        <label htmlFor="cantidad" className="mb-2 block text-sm font-semibold">
          Cantidad {unidad && <span className="font-normal text-muted-foreground">({unidad})</span>}
        </label>
        <div className="flex w-36 items-center rounded-md border bg-card">
          <button type="button" aria-label="Menos" className="p-2.5" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>
            <Minus className="size-4" />
          </button>
          <input
            id="cantidad"
            type="number"
            min={1}
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
            className="w-full min-w-0 bg-transparent text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" aria-label="Más" className="p-2.5" onClick={() => setCantidad((c) => c + 1)}>
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={alAgregar}
          disabled={!variante}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/90 disabled:opacity-50"
        >
          <ClipboardPlus className="size-5" aria-hidden />
          Agregar a mi cotización
        </button>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${mensaje}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Cotizar por WhatsApp
          </a>
        )}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5 text-green-600" aria-hidden />
          Cotización sin costo: te conseguimos el mejor precio.
        </p>
      </div>
    </div>
  )
}
