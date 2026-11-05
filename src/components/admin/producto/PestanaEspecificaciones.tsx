import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Seccion } from './campos'
import type { FormProducto } from './modelo'

const SUGERIDOS = ['Detalles del producto', 'Medidas', 'Características']

export function PestanaEspecificaciones() {
  const { control, register } = useFormContext<FormProducto>()
  const { fields, append, remove } = useFieldArray({ control, name: 'grupos' })
  const usados = new Set(fields.map((f) => f.grupo))

  return (
    <div className="flex flex-col gap-5">
      <Seccion
        titulo="Especificaciones del producto"
        descripcion="Datos que aplican a todas las variantes, agrupados como en la ficha. Las medidas que cambian por variante (calibre, diámetro) van en la pestaña Variantes. Sin marca ni modelo comercial."
      >
        {fields.length === 0 && <p className="text-sm text-muted-foreground">Sin especificaciones todavía.</p>}
        {fields.map((f, i) => (
          <div key={f.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <div className="flex gap-2">
              <Input {...register(`grupos.${i}.grupo` as const)} placeholder="Nombre del grupo" aria-label="Nombre del grupo" className="font-medium" />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Quitar grupo" className="text-muted-foreground hover:text-destructive">
                <Trash2 />
              </Button>
            </div>
            <Textarea
              {...register(`grupos.${i}.filas` as const)}
              rows={5}
              placeholder={'Una por línea, «Dato: valor»\nMaterial: Acero de bajo carbono\nAcabado: Liso\nPeso: 25 kg'}
              aria-label={`Filas del grupo ${i + 1}`}
              className="font-mono text-xs"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {SUGERIDOS.filter((s) => !usados.has(s)).map((s) => (
            <Button key={s} type="button" variant="outline" size="sm" onClick={() => append({ grupo: s, filas: '' })}>
              <Plus /> {s}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => append({ grupo: '', filas: '' })}>
            <Plus /> Otro grupo
          </Button>
        </div>
      </Seccion>
    </div>
  )
}
