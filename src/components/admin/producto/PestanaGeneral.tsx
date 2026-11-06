import { useFormContext, useWatch } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Categoria } from '@/types/categoria'
import { Campo, Seccion, Seleccion } from './campos'
import type { FormProducto } from './modelo'
import { DOMINIO_SITIO } from '@/lib/sitio'

export function PestanaGeneral({ categorias, slugActual }: { categorias: Categoria[]; slugActual?: string }) {
  const { register, control, setValue } = useFormContext<FormProducto>()
  const [corta, slug, principal, adicionales] = useWatch({ control, name: ['descripcion_corta', 'slug', 'categoria_principal', 'categorias'] })

  const secciones = categorias.filter((c) => !c.padre)
  const familiasDe = (id: string) => categorias.filter((c) => c.padre === id)
  const sueltas = categorias.filter((c) => c.padre && !categorias.some((s) => s.id === c.padre))

  const alternarAdicional = (id: string, marcado: boolean) =>
    setValue('categorias', marcado ? [...adicionales, id] : adicionales.filter((c) => c !== id), { shouldDirty: true })

  return (
    <div className="flex flex-col gap-5">
      <Seccion titulo="Identidad" descripcion="Nombre genérico, como lo busca la gente. Sin marcas: el sitio no las muestra.">
        <Campo id="nombre" etiqueta="Nombre" obligatorio ayuda="Ej.: «Alambre pulido», «Varilla corrugada». Las variantes (calibre, medida) van en la pestaña Variantes.">
          <Input id="nombre" {...register('nombre', { required: true })} placeholder="Alambre pulido" />
        </Campo>
        <Campo
          id="slug"
          etiqueta="Dirección en el sitio"
          ayuda={
            slugActual
              ? 'Si la cambias, la dirección anterior seguirá llevando aquí (no se pierde lo ganado en Google).'
              : 'Se genera del nombre si la dejas vacía.'
          }
        >
          <div className="flex items-center rounded-md border border-input text-sm shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
            <span className="select-none pl-2.5 text-muted-foreground">{DOMINIO_SITIO}/producto/</span>
            <input id="slug" {...register('slug')} placeholder="se-genera-del-nombre" className="h-9 flex-1 bg-transparent pr-2.5 outline-none" />
          </div>
          {slugActual && slug && slug !== slugActual && (
            <p className="text-xs text-amber-700">La dirección cambiará de «{slugActual}» a «{slug}».</p>
          )}
        </Campo>
      </Seccion>

      <Seccion titulo="Clasificación">
        <Campo id="categoria_principal" etiqueta="Categoría principal" obligatorio ayuda="Define la ruta de navegación y la página de categoría donde aparece.">
          <Seleccion id="categoria_principal" {...register('categoria_principal')}>
            <option value="">— Elige una categoría —</option>
            {secciones.map((s) => (
              <optgroup key={s.id} label={s.nombre}>
                <option value={s.id}>{s.nombre} (sección completa)</option>
                {familiasDe(s.id).map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </optgroup>
            ))}
            {sueltas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Seleccion>
        </Campo>
        {categorias.length > 1 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">También aparece en</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {categorias.filter((c) => c.id !== principal).map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={adicionales.includes(c.id)} onCheckedChange={(v) => alternarAdicional(c.id, v === true)} />
                  {c.padre ? `${categorias.find((s) => s.id === c.padre)?.nombre ?? ''} › ` : ''}{c.nombre}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </Seccion>

      <Seccion titulo="Contenido" descripcion="Con palabras propias: no copies los textos del proveedor (DEC-012).">
        <Campo id="descripcion_corta" etiqueta="Descripción corta" obligatorio contador={{ actual: corta.length, max: 160 }} ayuda="Se ve en tarjetas, resultados y en Google.">
          <Textarea id="descripcion_corta" rows={2} {...register('descripcion_corta')} />
        </Campo>
        <Campo id="descripcion" etiqueta="Descripción" obligatorio ayuda="Para qué sirve, de qué está hecho, cómo elegir la variante correcta.">
          <Textarea id="descripcion" rows={6} {...register('descripcion')} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="ventajas" etiqueta="Ventajas" ayuda="Una por línea.">
            <Textarea id="ventajas" rows={4} {...register('ventajas')} placeholder={'Diámetro uniforme\nSuperficie lisa'} />
          </Campo>
          <Campo id="aplicaciones" etiqueta="Aplicaciones" ayuda="Una por línea.">
            <Textarea id="aplicaciones" rows={4} {...register('aplicaciones')} placeholder={'Parrillas\nPaneles'} />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Disponibilidad">
        <Campo id="disponibilidad" etiqueta="Disponibilidad" ayuda="«Descontinuado» no borra la página: sigue en Google y ofrece alternativas.">
          <Seleccion id="disponibilidad" {...register('disponibilidad')} className="sm:w-64">
            <option value="disponible">Disponible</option>
            <option value="bajo_pedido">Bajo pedido</option>
            <option value="descontinuado">Descontinuado</option>
          </Seleccion>
        </Campo>
      </Seccion>
    </div>
  )
}
