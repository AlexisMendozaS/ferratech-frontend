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
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'

import { categoriasService } from '@/services/categorias'
import { productosService } from '@/services/productos'
import type { Categoria } from '@/types/categoria'

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
})

type CategoriaFormValues = z.infer<typeof categoriaSchema>

// ---------------------------------------------------------------------------
// Dialog de creación / edición
// ---------------------------------------------------------------------------

interface CategoriaDialogProps {
  open: boolean
  categoria?: Categoria
  onClose: () => void
  onSaved: (categoria: Categoria) => void
}

function CategoriaDialog({ open, categoria, onClose, onSaved }: CategoriaDialogProps) {
  const isEditing = !!categoria
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CategoriaFormValues>({
    resolver: standardSchemaResolver(categoriaSchema),
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
      imagen: categoria?.imagen ?? '',
    },
  })

  // Sincronizar valores cuando cambia la categoría (modo edición)
  useEffect(() => {
    if (open) {
      form.reset({
        nombre: categoria?.nombre ?? '',
        descripcion: categoria?.descripcion ?? '',
        imagen: categoria?.imagen ?? '',
      })
      setImagePreview(categoria?.imagen ?? null)
      setImageFile(null)
      setSubmitError(null)
    }
  }, [open, categoria, form])

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
      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        imagen: imageFile ? null : (values.imagen || null),
      }

      let saved: Categoria
      if (isEditing) {
        saved = await categoriasService.actualizar(categoria.id, payload)
      } else {
        saved = await categoriasService.crear(payload)
      }

      onSaved(saved)
    } catch {
      setSubmitError('No se pudo guardar la categoría. Intenta de nuevo.')
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
// Tarjeta de categoría
// ---------------------------------------------------------------------------

interface CategoriaCardProps {
  categoria: Categoria
  productCount: number
  onEdit: () => void
  onDelete: () => void
}

function CategoriaCard({ categoria, productCount, onEdit, onDelete }: CategoriaCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
      {categoria.imagen ? (
        <img
          src={categoria.imagen}
          alt={categoria.nombre}
          className="size-14 shrink-0 rounded-lg object-cover border"
        />
      ) : (
        <div className="size-14 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <Tag className="size-6" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{categoria.nombre}</p>
        {categoria.descripcion && (
          <p className="text-sm text-muted-foreground truncate">{categoria.descripcion}</p>
        )}
        <Badge variant="secondary" className="mt-1 text-xs">
          {productCount} {productCount === 1 ? 'producto' : 'productos'}
        </Badge>
      </div>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`Editar ${categoria.nombre}`}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label={`Eliminar ${categoria.nombre}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function CategoriasAdminPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productCountMap, setProductCountMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog estado
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Categoria | undefined>()

  // Delete estado
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      categoriasService.listar(),
      productosService.listar(100, 0),
    ])
      .then(([cats, prods]) => {
        setCategorias(cats)
        const countMap = new Map<string, number>()
        cats.forEach((c) => countMap.set(c.id, 0))
        prods.forEach((p) =>
          p.categorias.forEach((cid) =>
            countMap.set(cid, (countMap.get(cid) ?? 0) + 1)
          )
        )
        setProductCountMap(countMap)
      })
      .catch(() => setError('No se pudo cargar las categorías.'))
      .finally(() => setLoading(false))
  }, [])

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
    setDialogOpen(true)
  }

  const openEdit = (cat: Categoria) => {
    setEditTarget(cat)
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
    } catch {
      setDeleteError('No se pudo eliminar la categoría. Intenta de nuevo.')
    }
  }

  const deleteCount = deleteTarget ? (productCountMap.get(deleteTarget.id) ?? 0) : 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Organiza el catálogo en categorías.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          Cargando categorías…
        </div>
      ) : (
        <>
          <Separator />
          {categorias.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Tag className="size-8 opacity-40" />
              <p className="text-sm">Aún no hay categorías. Crea la primera.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categorias.map((cat) => (
                <CategoriaCard
                  key={cat.id}
                  categoria={cat}
                  productCount={productCountMap.get(cat.id) ?? 0}
                  onEdit={() => openEdit(cat)}
                  onDelete={() => openDelete(cat)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialog crear / editar */}
      <CategoriaDialog
        open={dialogOpen}
        categoria={editTarget}
        onClose={() => {
          setDialogOpen(false)
          setEditTarget(undefined)
        }}
        onSaved={handleSaved}
      />

      {/* AlertDialog eliminar */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Vas a eliminar <strong className="text-foreground">{deleteTarget?.nombre}</strong>.
                  Esta acción no se puede deshacer.
                </p>
                {deleteCount > 0 && (
                  <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    ⚠️ Esta categoría tiene <strong>{deleteCount}</strong>{' '}
                    {deleteCount === 1 ? 'producto asignado' : 'productos asignados'}.
                    Los productos no se eliminarán, pero quedarán sin esta categoría.
                  </p>
                )}
                {deleteError && (
                  <p className="text-destructive">{deleteError}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {deleteCount > 0 ? 'Eliminar de todas formas' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
