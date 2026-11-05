import { useFormContext, useWatch } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Campo, Seccion } from './campos'
import type { FormProducto } from './modelo'

export function PestanaBusqueda() {
  const { register, control } = useFormContext<FormProducto>()
  const [titulo, descripcion] = useWatch({ control, name: ['meta_titulo', 'meta_descripcion'] })

  return (
    <div className="flex flex-col gap-5">
      <Seccion
        titulo="Cómo lo encuentra la gente"
        descripcion="Alimenta el buscador del sitio. No uses marcas de otros para atraer búsquedas (DEC-012)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="sinonimos" etiqueta="Sinónimos" ayuda="Otros nombres del mismo producto, uno por línea: «fierro», «varilla corrugada».">
            <Textarea id="sinonimos" rows={5} {...register('sinonimos')} />
          </Campo>
          <Campo id="terminos" etiqueta="Usos y problemas que resuelve" ayuda="Lo que alguien escribiría sin saber el nombre: «amarrar varilla», «reforzar castillo».">
            <Textarea id="terminos" rows={5} {...register('terminos')} />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Google" descripcion="Opcional: si los dejas vacíos se usan el nombre y la descripción corta. Mira la vista previa a la derecha.">
        <Campo id="meta_titulo" etiqueta="Título en Google" contador={{ actual: titulo.length, max: 70 }}>
          <Input id="meta_titulo" {...register('meta_titulo')} />
        </Campo>
        <Campo id="meta_descripcion" etiqueta="Descripción en Google" contador={{ actual: descripcion.length, max: 160 }}>
          <Textarea id="meta_descripcion" rows={3} {...register('meta_descripcion')} />
        </Campo>
      </Seccion>
    </div>
  )
}
