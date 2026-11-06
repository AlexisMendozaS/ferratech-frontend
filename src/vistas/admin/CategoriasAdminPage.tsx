import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { ImagePlus, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { categoriasService } from '@/services/categorias'
import { adminProductosService, motivosDeError } from '@/services/adminProductos'
import { Seleccion } from '@/components/admin/producto/campos'
import type { Categoria } from '@/types/categoria'
import { CargandoFilas, EncabezadoPanel, EstadoError, EstadoVacio, EtiquetaEstado } from '@/components/admin/panel'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Schema del formulario
// ---------------------------------------------------------------------------

const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional().default(''),
  imagen: z
    .string()
    .url('Ingresa una URL válida')
    .optional()
    .or(z.literal(''))
    .default(''),
  padre: z.string().default(''),
  estado: z.enum(['activa', 'oculta']).default('activa'),
})

type CategoriaFormValues = z.infer<typeof categoriaSchema>

// ---------------------------------------------------------------------------
// Dialog de creación / edición
// ---------------------------------------------------------------------------

interface CategoriaDialogProps {
  open: boolean
  categoria?: Categoria
  /** Secciones disponibles como padre (las categorías sin padre, menos la propia). */
  secciones: Categoria[]
  onClose: () => void
  onSaved: (categoria: Categoria) => void
}

// El padre lo remonta con una `key` nueva cada vez que se abre, así el formulario
// y la vista previa arrancan limpios sin sincronizarlos en un efecto.
function CategoriaDialog({ open, categoria, secciones, onClose, onSaved }: CategoriaDialogProps) {
  const isEditing = !!categoria
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(categoria?.imagen ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CategoriaFormValues>({
    resolver: standardSchemaResolver(categoriaSchema),
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
      imagen: categoria?.imagen ?? '',
      padre: categoria?.padre ?? '',
      estado: categoria?.estado ?? 'activa',
    },
  })

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    form.setValue('imagen', localUrl)
  }

  const clearImage = () => {
    setImagePreview(null)
    setImageFile(null)
    form.setValue('imagen', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (values: CategoriaFormValues) => {
    setSubmitError(null)
    try {
      // Antes la imagen elegida como archivo se descartaba; ahora se sube y se guarda su URL.
      const imagen = imageFile ? await adminProductosService.subirImagen(imageFile) : values.imagen || null
      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        imagen,
        padre: values.padre || null,
        estado: values.estado,
      }

      let saved: Categoria
      if (isEditing) {
        saved = await categoriasService.actualizar(categoria.id, payload)
      } else {
        saved = await categoriasService.crear(payload)
      }

      onSaved(saved)
    } catch (e) {
      setSubmitError(motivosDeError(e).join(' · '))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="ej. Obra negra, Acabados…" {...field} />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción breve de la categoría (opcional)"
                      className="resize-none min-h-[72px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="padre" className="text-sm font-medium">Sección</label>
                <Seleccion id="padre" {...form.register('padre')}>
                  <option value="">Es una sección</option>
                  {secciones.map((s) => <option key={s.id} value={s.id}>Familia de: {s.nombre}</option>)}
                </Seleccion>
              </div>
              <div className="space-y-2">
                <label htmlFor="estado" className="text-sm font-medium">Estado</label>
                <Seleccion id="estado" {...form.register('estado')}>
                  <option value="activa">Activa</option>
                  <option value="oculta">Oculta (no se ve en el sitio)</option>
                </Seleccion>
              </div>
            </div>

            {/* Imagen: preview o campo URL */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Imagen (opcional)</span>

              {imagePreview ? (
                <div className="relative w-fit">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground size-5 flex items-center justify-center shadow"
                    aria-label="Quitar imagen"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-ring hover:text-foreground transition-colors"
                    aria-label="Subir imagen"
                  >
                    <ImagePlus className="size-5" />
                  </button>

                  <FormField
                    control={form.control}
                    name="imagen"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="O pega una URL de imagen"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (e.target.value) setImagePreview(e.target.value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageFile}
              />
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando…'
                  : isEditing
                  ? 'Guardar cambios'
                  : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Fila de categoría (sección o familia)
// ---------------------------------------------------------------------------

interface FilaCategoriaProps {
  categoria: Categoria
  productos: number
  familia?: boolean
  onEdit: () => void
  onDelete: () => void
}

function FilaCategoria({ categoria, productos, familia = false, onEdit, onDelete }: FilaCategoriaProps) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', familia && 'pl-6 sm:pl-14')}>
      {!familia &&
        (categoria.imagen ? (
          <img src={categoria.imagen} alt="" className="size-10 shrink-0 rounded-lg border bg-white object-contain" />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Tag className="size-5" aria-hidden />
          </div>
        ))}
      <div className="min-w-0 flex-1">
        <p className={cn('flex flex-wrap items-center gap-2', familia ? 'text-sm' : 'font-semibold')}>
          <span className="truncate">{categoria.nombre}</span>
          {categoria.estado === 'oculta' && <EtiquetaEstado texto="Oculta" tono="neutro" />}
        </p>
        {categoria.descripcion && !familia && <p className="truncate text-sm text-muted-foreground">{categoria.descripcion}</p>}
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {productos} producto{productos === 1 ? '' : 's'}
      </span>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Editar ${categoria.nombre}`}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label={`Eliminar ${categoria.nombre}`}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

const ordenar = (a: Categoria, b: Categoria) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es')

export default function CategoriasAdminPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productCountMap, setProductCountMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)

  // Dialog estado
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Categoria | undefined>()
  const [dialogKey, setDialogKey] = useState(0)

  // Delete estado
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    Promise.all([categoriasService.listar(true), adminProductosService.listar({ limit: 100 })])
      .then(([cats, pagina]) => {
        if (!vigente) return
        setCategorias(cats)
        const countMap = new Map<string, number>()
        cats.forEach((c) => countMap.set(c.id, 0))
        pagina.productos.forEach((p) =>
          new Set([p.categoria_principal, ...p.categorias]).forEach((cid) => {
            if (cid) countMap.set(cid, (countMap.get(cid) ?? 0) + 1)
          }),
        )
        setProductCountMap(countMap)
        setError(false)
      })
      .catch(() => vigente && setError(true))
      .finally(() => vigente && setLoading(false))
    return () => {
      vigente = false
    }
  }, [intento])

  const reintentar = () => {
    setError(false)
    setLoading(true)
    setIntento((n) => n + 1)
  }

  const handleSaved = (saved: Categoria) => {
    setCategorias((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      setProductCountMap((m) => new Map(m).set(saved.id, 0))
      return [...prev, saved]
    })
    setDialogOpen(false)
    setEditTarget(undefined)
  }

  const openCreate = () => {
    setEditTarget(undefined)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const openEdit = (cat: Categoria) => {
    setEditTarget(cat)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const openDelete = (cat: Categoria) => {
    setDeleteError(null)
    setDeleteTarget(cat)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoriasService.eliminar(deleteTarget.id)
      setCategorias((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      setDeleteError(motivosDeError(e).join(' · ') || 'No se pudo eliminar la categoría. Intenta de nuevo.')
    }
  }

  const secciones = categorias.filter((c) => !c.padre).sort(ordenar)
  const familiasDe = (id: string) => categorias.filter((c) => c.padre === id).sort(ordenar)
  // Las familias cuyo padre ya no existe se muestran aparte para poder corregirlas.
  const huerfanas = categorias.filter((c) => c.padre && !categorias.some((s) => s.id === c.padre))
  const productosDe = (id: string) => productCountMap.get(id) ?? 0
  const productosDeSeccion = (id: string) => productosDe(id) + familiasDe(id).reduce((n, f) => n + productosDe(f.id), 0)

  // El servidor no deja borrar una categoría con familias o productos: se explica antes de intentarlo.
  const familiasDelBorrado = deleteTarget ? familiasDe(deleteTarget.id).length : 0
  const productosDelBorrado = deleteTarget ? productosDe(deleteTarget.id) : 0
  const bloqueado = familiasDelBorrado > 0 || productosDelBorrado > 0

  return (
    <div className="space-y-5">
      <EncabezadoPanel
        titulo="Categorías"
        descripcion={`${plural(secciones.length, 'sección', 'secciones')} y ${plural(categorias.length - secciones.length, 'familia', 'familias')}. Cada una tiene su página en el sitio.`}
        acciones={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        }
      />

      {error ? (
        <EstadoError texto="No se pudieron cargar las categorías. Revisa la conexión con el servidor." onReintentar={reintentar} />
      ) : loading ? (
        <CargandoFilas filas={4} />
      ) : categorias.length === 0 ? (
        <EstadoVacio
          icono={Tag}
          titulo="Aún no hay categorías"
          texto="Crea primero una sección (por ejemplo, «Acero de refuerzo») y dentro sus familias («Varilla y alambrón»)."
          accion={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Nueva categoría
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {[...secciones, ...huerfanas].map((seccion) => (
            <li key={seccion.id} className="overflow-hidden rounded-xl border bg-card">
              <FilaCategoria
                categoria={seccion}
                productos={productosDeSeccion(seccion.id)}
                onEdit={() => openEdit(seccion)}
                onDelete={() => openDelete(seccion)}
              />
              {familiasDe(seccion.id).length > 0 && (
                <ul className="divide-y border-t bg-muted/20" aria-label={`Familias de ${seccion.nombre}`}>
                  {familiasDe(seccion.id).map((f) => (
                    <li key={f.id}>
                      <FilaCategoria categoria={f} productos={productosDe(f.id)} familia onEdit={() => openEdit(f)} onDelete={() => openDelete(f)} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Dialog crear / editar */}
      <CategoriaDialog
        key={dialogKey}
        open={dialogOpen}
        categoria={editTarget}
        secciones={secciones.filter((c) => c.id !== editTarget?.id)}
        onClose={() => {
          setDialogOpen(false)
          setEditTarget(undefined)
        }}
        onSaved={handleSaved}
      />

      {/* AlertDialog eliminar */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bloqueado ? `«${deleteTarget?.nombre}» no se puede eliminar todavía` : '¿Eliminar categoría?'}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                {bloqueado ? (
                  <p>
                    Tiene{' '}
                    {[
                      familiasDelBorrado > 0 && `${familiasDelBorrado} familia${familiasDelBorrado === 1 ? '' : 's'}`,
                      productosDelBorrado > 0 && `${productosDelBorrado} producto${productosDelBorrado === 1 ? '' : 's'}`,
                    ]
                      .filter(Boolean)
                      .join(' y ')}
                    . Muévelos a otra categoría primero, o márcala como <strong>oculta</strong> para que deje de verse en el sitio.
                  </p>
                ) : (
                  <p>
                    Vas a eliminar <strong className="text-foreground">{deleteTarget?.nombre}</strong> y su página del sitio. No se puede deshacer.
                  </p>
                )}
                {deleteError && <p className="text-destructive">{deleteError}</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{bloqueado ? 'Entendido' : 'Cancelar'}</AlertDialogCancel>
            {!bloqueado && (
              <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
