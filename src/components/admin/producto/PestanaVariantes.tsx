import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UNIDADES_VENTA, describeVariante } from '@/types/producto'
import { Seccion, Seleccion } from './campos'
import { generarVariantes, separadasPorComa, varianteVacia, type FormProducto } from './modelo'

const celda = 'h-8 min-w-0 px-2 text-sm'

export function PestanaVariantes() {
  const { control, register, getValues, setValue } = useFormContext<FormProducto>()
  const ejes = useFieldArray({ control, name: 'ejes' })
  const columnas = useFieldArray({ control, name: 'columnas' })
  const variantes = useFieldArray({ control, name: 'variantes' })
  const ejesActuales = useWatch({ control, name: 'ejes' })

  const combinaciones = ejesActuales
    .map((e) => separadasPorComa(e.opciones).length)
    .filter((n) => n > 0)
    .reduce((a, b) => a * b, 1)

  const generar = () => {
    variantes.replace(generarVariantes(getValues('ejes'), getValues('variantes'), getValues('columnas').length))
  }

  const agregarColumna = () => {
    columnas.append({ clave: '', unidad: '' })
    getValues('variantes').forEach((v, i) => setValue(`variantes.${i}.medidas`, [...v.medidas, '']))
  }

  const quitarColumna = (c: number) => {
    columnas.remove(c)
    getValues('variantes').forEach((v, i) => setValue(`variantes.${i}.medidas`, v.medidas.filter((_, j) => j !== c)))
  }

  return (
    <div className="flex flex-col gap-5">
      <Seccion
        titulo="Opciones que elige el cliente"
        descripcion="Ej.: Calibre (16, 14, 12) o Medida (3/8″, 1/2″). Si el producto tiene una sola presentación, déjalo vacío."
        accion={
          <Button type="button" variant="outline" size="sm" onClick={() => ejes.append({ nombre: '', opciones: '' })}>
            <Plus /> Opción
          </Button>
        }
      >
        {ejes.fields.length === 0 && <p className="text-sm text-muted-foreground">Presentación única: una sola variante.</p>}
        {ejes.fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] gap-2">
            <Input {...register(`ejes.${i}.nombre` as const)} placeholder="Calibre" aria-label="Nombre de la opción" />
            <Input {...register(`ejes.${i}.opciones` as const)} placeholder="16, 14, 12 (separadas por coma)" aria-label="Valores" />
            <Button type="button" variant="ghost" size="icon" onClick={() => ejes.remove(i)} aria-label="Quitar opción" className="text-muted-foreground hover:text-destructive">
              <Trash2 />
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={generar}>
            <RefreshCw /> {ejes.fields.length ? `Generar ${combinaciones} variante${combinaciones === 1 ? '' : 's'}` : 'Dejar una sola variante'}
          </Button>
          <p className="text-xs text-muted-foreground">Conserva lo ya capturado en las combinaciones que sigan existiendo.</p>
        </div>
      </Seccion>

      <Seccion
        titulo="Variantes"
        descripcion="Cada variante tiene su SKU (si lo dejas vacío se genera, p. ej. ALP-CAL16) y su unidad de venta. Las medidas que cambian por variante van como columnas, como la tabla de calibres del catálogo."
        accion={
          <Button type="button" variant="outline" size="sm" onClick={agregarColumna}>
            <Plus /> Columna de medida
          </Button>
        }
      >
        {variantes.fields.length === 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Sin variantes: para publicar hace falta al menos una.
            <Button type="button" size="sm" onClick={() => variantes.append(varianteVacia({}, columnas.fields.length))}>
              <Plus /> Agregar
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs">
                <tr>
                  <th className="px-2 py-2 font-medium">Variante</th>
                  <th className="px-2 py-2 font-medium">SKU</th>
                  <th className="px-2 py-2 font-medium">Unidad</th>
                  <th className="px-2 py-2 font-medium">Mínimo</th>
                  {columnas.fields.map((c, j) => (
                    <th key={c.id} className="px-2 py-1.5 font-medium">
                      <div className="flex items-center gap-1">
                        <Input {...register(`columnas.${j}.clave` as const)} placeholder="Diámetro" aria-label="Nombre de la medida" className={`${celda} w-24`} />
                        <Input {...register(`columnas.${j}.unidad` as const)} placeholder="mm" aria-label="Unidad de la medida" className={`${celda} w-14`} />
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => quitarColumna(j)} aria-label="Quitar columna">
                          <Trash2 />
                        </Button>
                      </div>
                    </th>
                  ))}
                  <th className="px-2 py-2 font-medium">Disponibilidad</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {variantes.fields.map((v, i) => (
                  <tr key={v.id} className="border-t border-border align-middle">
                    <td className="whitespace-nowrap px-2 py-1.5 font-medium">{describeVariante(v.valores) || 'Única'}</td>
                    <td className="px-2 py-1.5"><Input {...register(`variantes.${i}.sku` as const)} placeholder="automático" aria-label="SKU" className={`${celda} w-28 uppercase`} /></td>
                    <td className="px-2 py-1.5">
                      <Seleccion {...register(`variantes.${i}.unidad_venta` as const)} aria-label="Unidad de venta" className={`${celda} w-24`}>
                        {UNIDADES_VENTA.map((u) => <option key={u} value={u}>{u}</option>)}
                      </Seleccion>
                    </td>
                    <td className="px-2 py-1.5"><Input type="number" min={0} step="any" {...register(`variantes.${i}.venta_minima` as const)} aria-label="Venta mínima" className={`${celda} w-16`} /></td>
                    {columnas.fields.map((c, j) => (
                      <td key={c.id} className="px-2 py-1.5">
                        <Input {...register(`variantes.${i}.medidas.${j}` as const)} aria-label="Valor de la medida" className={`${celda} w-full tabular-nums`} />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <Seleccion {...register(`variantes.${i}.disponibilidad` as const)} aria-label="Disponibilidad de la variante" className={`${celda} w-32`}>
                        <option value="">Como el producto</option>
                        <option value="disponible">Disponible</option>
                        <option value="bajo_pedido">Bajo pedido</option>
                        <option value="descontinuado">Descontinuado</option>
                      </Seleccion>
                    </td>
                    <td className="px-2 py-1.5">
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => variantes.remove(i)} aria-label="Quitar variante" className="text-muted-foreground hover:text-destructive">
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          En la página del producto, el cliente elige las opciones y ve esta tabla de medidas (sin SKU interno de proveedor ni precio).
        </p>
      </Seccion>
    </div>
  )
}
