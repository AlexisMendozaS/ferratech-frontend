import { useFormContext, useWatch } from 'react-hook-form'
import { CheckCircle2, CircleAlert } from 'lucide-react'

import { ProductCard } from '@/components/productos/ProductCard'
import { faltantesParaPublicar, type FormProducto } from './modelo'

const slugify = (t: string) =>
  t.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Lo que falta para publicar, cómo se verá en Google y cómo se verá la tarjeta. */
export function PanelLateral() {
  const { control } = useFormContext<FormProducto>()
  const valores = useWatch({ control }) as FormProducto
  const faltan = faltantesParaPublicar(valores)
  const slug = valores.slug?.trim() ? slugify(valores.slug) : slugify(valores.nombre ?? '') || 'producto'
  const titulo = valores.meta_titulo?.trim() || `${valores.nombre || 'Nombre del producto'} | FerraTech`
  const descripcion = valores.meta_descripcion?.trim() || valores.descripcion_corta?.trim() || 'Agrega una descripción corta: es lo que verá la gente en Google.'

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="mb-3 text-sm font-semibold">Para publicar</h2>
        {faltan.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-4" /> Listo para publicar</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {faltan.map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground"><CircleAlert className="size-4 text-amber-600" /> {f}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="mb-3 text-sm font-semibold">Así se verá en Google</h2>
        <div className="font-[arial,sans-serif]">
          <p className="truncate text-xs text-[#4d5156]">ferratech.com.mx › producto › {slug}</p>
          <p className="mt-0.5 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{titulo}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">{descripcion}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="mb-3 text-sm font-semibold">Así se verá la tarjeta</h2>
        <div className="mx-auto w-48 pointer-events-none" aria-hidden="true">
          <ProductCard
            producto={{
              id: 'vista-previa',
              slug,
              nombre: valores.nombre || 'Nombre del producto',
              descripcion_corta: valores.descripcion_corta || null,
              imagen: valores.galeria?.[0] ?? null,
              categoria_principal: valores.categoria_principal || null,
              disponibilidad: valores.disponibilidad ?? 'disponible',
              num_variantes: valores.variantes?.length ?? 0,
            }}
          />
        </div>
      </section>
    </aside>
  )
}
