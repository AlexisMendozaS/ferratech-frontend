import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { Plus, Trash2, X, ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { productosService } from '@/services/productos'
import { categoriasService } from '@/services/categorias'
import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const opcionSchema = z.object({
  valor: z.string().min(1, 'La opción no puede estar vacía'),
})

const atributoSchema = z.object({
  nombre: z.string().min(1, 'El nombre del atributo es requerido'),
  opciones: z.array(opcionSchema).min(1, 'Agrega al menos una opción'),
})

const productoFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  categorias: z.array(z.string()).default([]),
  bajo_pedido: z.boolean().default(false),
  atributos: z.array(atributoSchema).default([]),
})

type ProductoFormValues = z.infer<typeof productoFormSchema>

// ---------------------------------------------------------------------------
// AtributoField — sección dinámica de un atributo con sus opciones
// ---------------------------------------------------------------------------

interface AtributoFieldProps {
  atributoIndex: number
  control: ReturnType<typeof useForm<ProductoFormValues>>['control']
  onRemove: () => void
}

function AtributoField({ atributoIndex, control, onRemove }: AtributoFieldProps) {
  const [opcionInput, setOpcionInput] = useState('')

  const { fields: opcionFields, append: appendOpcion, remove: removeOpcion } =
    useFieldArray({
      control,
      name: `atributos.${atributoIndex}.opciones`,
    })

  const addOpcion = () => {
    const trimmed = opcionInput.trim()
    if (!trimmed) return
    appendOpcion({ valor: trimmed })
    setOpcionInput('')
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <FormField
          control={control}
          name={`atributos.${atributoIndex}.nombre`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Nombre del atributo</FormLabel>
              <FormControl>
                <Input placeholder="ej. Material, Color, Tamaño…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Eliminar atributo"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Opciones</Label>

        {opcionFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {opcionFields.map((opcion, opcionIndex) => (
              <Badge key={opcion.id} variant="secondary" className="gap-1 pr-1">
                {opcion.valor}
                <button
                  type="button"
                  onClick={() => removeOpcion(opcionIndex)}
                  className="rounded-sm opacity-70 hover:opacity-100"
                  aria-label={`Eliminar opción ${opcion.valor}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <FormField
          control={control}
          name={`atributos.${atributoIndex}.opciones`}
          render={() => <FormMessage />}
        />

        <div className="flex gap-2">
          <Input
            value={opcionInput}
            onChange={(e) => setOpcionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addOpcion()
              }
            }}
            placeholder="Escribe una opción y presiona Enter o +"
          />
          <Button type="button" variant="outline" size="icon" onClick={addOpcion}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProductoForm
// ---------------------------------------------------------------------------

interface ProductoFormProps {
  producto?: Producto
  onSuccess?: (producto: Producto) => void
  onCancel?: () => void
}

export function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const isEditing = !!producto

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    producto?.imagen_principal ?? null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    categoriasService.listar().then(setCategorias).catch(console.error)
  }, [])

  const form = useForm<ProductoFormValues>({
    resolver: standardSchemaResolver(productoFormSchema),
    defaultValues: producto
      ? {
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categorias: producto.categorias,
          bajo_pedido: producto.bajo_pedido,
          atributos: producto.atributos.map((a) => ({
            nombre: a.nombre,
            opciones: a.opciones.map((v) => ({ valor: v })),
          })),
        }
      : {
          nombre: '',
          descripcion: '',
          categorias: [],
          bajo_pedido: false,
          atributos: [],
        },
  })

  const {
    fields: atributoFields,
    append: appendAtributo,
    remove: removeAtributo,
  } = useFieldArray({
    control: form.control,
    name: 'atributos',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (values: ProductoFormValues) => {
    setSubmitError(null)
    try {
      const payload = {
        ...values,
        atributos: values.atributos.map((a) => ({
          nombre: a.nombre,
          opciones: a.opciones.map((o) => o.valor),
        })),
      }

      let saved: Producto
      if (isEditing) {
        saved = await productosService.actualizar(producto.id, payload)
      } else {
        saved = await productosService.crear(payload)
      }

      if (imageFile) {
        await productosService.subirImagen(saved.id, imageFile)
      }

      onSuccess?.(saved)
    } catch (err) {
      setSubmitError('Ocurrió un error al guardar el producto. Intenta de nuevo.')
      console.error(err)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Información básica */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Información básica</h2>
          <Separator />

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="ej. Taladro Percutor 750W" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe el producto, sus características principales…"
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Imagen */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Imagen principal</h2>
          <Separator />

          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative w-fit">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="h-48 w-48 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setImageFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground size-5 flex items-center justify-center shadow"
                  aria-label="Quitar imagen"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-ring hover:text-foreground transition-colors"
              >
                <ImagePlus className="size-8" />
                <span className="text-sm text-center px-2">
                  JPG, PNG o WebP — máx. 5MB
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />

            {imagePreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar imagen
              </Button>
            )}
          </div>
        </section>

        {/* Categorías */}
        {categorias.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-semibold">Categorías</h2>
            <Separator />

            <FormField
              control={form.control}
              name="categorias"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categorias.map((cat) => {
                      const checked = field.value.includes(cat.id)
                      return (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const next = v
                                ? [...field.value, cat.id]
                                : field.value.filter((id) => id !== cat.id)
                              field.onChange(next)
                            }}
                          />
                          <span className="text-sm">{cat.nombre}</span>
                        </label>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        )}

        {/* Bajo pedido */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Disponibilidad</h2>
          <Separator />

          <FormField
            control={form.control}
            name="bajo_pedido"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-start gap-3 cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="cursor-pointer">Bajo pedido</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      El producto no tiene stock inmediato y se solicita por encargo.
                    </p>
                  </div>
                </label>
              </FormItem>
            )}
          />
        </section>

        {/* Atributos dinámicos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Atributos y variantes</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAtributo({ nombre: '', opciones: [] })}
            >
              <Plus className="size-4" />
              Agregar atributo
            </Button>
          </div>
          <Separator />

          {atributoFields.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin atributos. Agrega variantes como "Material" o "Color" si aplica.
            </p>
          ) : (
            <div className="space-y-3">
              {atributoFields.map((field, index) => (
                <AtributoField
                  key={field.id}
                  atributoIndex={index}
                  control={form.control}
                  onRemove={() => removeAtributo(index)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Error global */}
        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Guardando…'
              : isEditing
              ? 'Guardar cambios'
              : 'Crear producto'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
