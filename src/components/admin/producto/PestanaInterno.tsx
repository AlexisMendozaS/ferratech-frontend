import { useFieldArray, useFormContext } from 'react-hook-form'
import { Lock, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { describeVariante } from '@/types/producto'
import { Campo, Seccion } from './campos'
import type { FormProducto } from './modelo'

function ProveedoresDeVariante({ indice }: { indice: number }) {
  const { control, register } = useFormContext<FormProducto>()
  const { fields, append, remove } = useFieldArray({ control, name: `variantes.${indice}.proveedores` })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((f, p) => (
        <div key={f.id} className="grid grid-cols-[1fr_8rem_7rem_auto] gap-2">
          <Input {...register(`variantes.${indice}.proveedores.${p}.nombre` as const)} placeholder="Proveedor" aria-label="Proveedor" className="h-8" />
          <Input {...register(`variantes.${indice}.proveedores.${p}.clave` as const)} placeholder="Su clave" aria-label="Clave del proveedor" className="h-8" />
          <Input type="number" min={0} step="any" {...register(`variantes.${indice}.proveedores.${p}.costo` as const)} placeholder="Costo $" aria-label="Costo" className="h-8" />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(p)} aria-label="Quitar proveedor" className="text-muted-foreground hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => append({ nombre: '', clave: '', costo: '' })}>
        <Plus /> Proveedor
      </Button>
    </div>
  )
}

export function PestanaInterno() {
  const { register, watch } = useFormContext<FormProducto>()
  const variantes = watch('variantes')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <Lock className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-semibold">Nada de esta pestaña se publica.</span> FerraTech vende como intermediario: el sitio, Google y las
          cotizaciones al cliente nunca muestran marca, proveedor ni precio (DEC-012). Úsalo para saber dónde conseguir cada material al mejor precio.
        </p>
      </div>

      <Seccion titulo="Datos del producto">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo id="marca" etiqueta="Marca"><Input id="marca" {...register('interno.marca')} /></Campo>
          <Campo id="modelo" etiqueta="Modelo"><Input id="modelo" {...register('interno.modelo')} /></Campo>
          <Campo id="fabricante" etiqueta="Fabricante"><Input id="fabricante" {...register('interno.fabricante')} /></Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Campo id="fuente_documento" etiqueta="Capturado de" ayuda="Documento de origen, para revisar contra el original.">
            <Input id="fuente_documento" {...register('interno.fuente_documento')} placeholder="Nombre del catálogo o lista" />
          </Campo>
          <Campo id="fuente_pagina" etiqueta="Página"><Input id="fuente_pagina" type="number" min={1} {...register('interno.fuente_pagina')} /></Campo>
        </div>
        <Campo id="notas" etiqueta="Notas"><Textarea id="notas" rows={3} {...register('interno.notas')} /></Campo>
      </Seccion>

      <Seccion titulo="Proveedores y referencia por variante" descripcion="Opcional. Varios proveedores por variante para comparar costos.">
        {variantes.length === 0 && <p className="text-sm text-muted-foreground">Primero define las variantes.</p>}
        {variantes.map((v, i) => (
          <div key={`${v.sku}-${i}`} className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-medium">{describeVariante(v.valores) || 'Variante única'} {v.sku && <span className="text-xs text-muted-foreground">· {v.sku}</span>}</p>
              <Campo id={`precio-${i}`} etiqueta="Precio de referencia (MXN)" className="w-48">
                <Input id={`precio-${i}`} type="number" min={0} step="any" {...register(`variantes.${i}.precio_referencia` as const)} className="h-8" />
              </Campo>
            </div>
            <ProveedoresDeVariante indice={i} />
          </div>
        ))}
      </Seccion>
    </div>
  )
}
