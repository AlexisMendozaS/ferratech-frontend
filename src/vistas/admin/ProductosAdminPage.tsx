import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { CircleAlert, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { useAsyncData } from '@/hooks/useAsyncData'
import { adminProductosService, motivosDeError } from '@/services/adminProductos'
import { categoriasService } from '@/services/categorias'
import type { EstadoProducto, ProductoAdmin } from '@/types/producto'

const ESTADOS: { valor: EstadoProducto | ''; texto: string }[] = [
  { valor: '', texto: 'Todos' },
  { valor: 'publicado', texto: 'Publicados' },
  { valor: 'borrador', texto: 'Borradores' },
  { valor: 'archivado', texto: 'Archivados' },
]

const CLASE_ESTADO: Record<EstadoProducto, string> = {
  publicado: 'bg-emerald-100 text-emerald-800',
  borrador: 'bg-muted text-muted-foreground',
  archivado: 'bg-zinc-200 text-zinc-700',
}

function columnas(categoria: (id: string | null) => string, onEdit: (id: string) => void, onDelete: (p: ProductoAdmin) => void): ColumnDef<ProductoAdmin>[] {
  return [
    {
      id: 'imagen',
      header: '',
      cell: ({ row }) => {
        const img = row.original.galeria[0]
        return img ? (
          <img src={img.url} alt="" className="size-10 rounded-md border object-cover" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">—</div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'nombre',
      header: 'Producto',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.nombre}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.variantes.length} variante{row.original.variantes.length === 1 ? '' : 's'}
            {row.original.variantes[0] && ` · ${row.original.variantes[0].sku}${row.original.variantes.length > 1 ? '…' : ''}`}
          </span>
        </div>
      ),
    },
    {
      id: 'categoria',
      header: 'Categoría',
      cell: ({ row }) => <span className="text-sm">{categoria(row.original.categoria_principal)}</span>,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex items-center gap-1.5">
            <Badge className={CLASE_ESTADO[p.estado]}>{p.estado}</Badge>
            {p.faltantes_para_publicar.length > 0 && (
              <span title={`Para publicar falta: ${p.faltantes_para_publicar.join(', ')}`} className="flex items-center gap-0.5 text-xs text-amber-700">
                <CircleAlert className="size-3.5" /> {p.faltantes_para_publicar.length}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(p.id)} aria-label={`Editar ${p.nombre}`}>
              <Pencil className="size-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Eliminar ${p.nombre}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar «{p.nombre}»?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se borra de forma permanente y su página deja de existir en Google. Si solo ya no se consigue,
                    márcalo como <strong>descontinuado</strong>: la página sigue viva y ofrece alternativas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDelete(p)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
      enableSorting: false,
    },
  ]
}

export default function ProductosAdminPage() {
  const navigate = useNavigate()
  const [estado, setEstado] = useState<EstadoProducto | ''>('')
  const [version, setVersion] = useState(0)

  // TODO(INI-009): paginar en el servidor cuando el catálogo pase de 100 productos.
  const { data, loading, error } = useAsyncData(
    () => adminProductosService.listar({ limit: 100, estado: estado || undefined }),
    `admin-productos:${estado}:${version}`,
  )
  const { data: categorias } = useAsyncData(() => categoriasService.listar(true), 'admin-categorias')
  const nombreCategoria = (id: string | null) => (id && categorias?.find((c) => c.id === id)?.nombre) || '—'

  const eliminar = async (p: ProductoAdmin) => {
    try {
      await adminProductosService.eliminar(p.id)
      toast.success('Producto eliminado', { description: p.nombre })
      setVersion((v) => v + 1)
    } catch (e) {
      toast.error(`No se pudo eliminar «${p.nombre}»`, { description: motivosDeError(e)[0] })
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.total} producto${data.total === 1 ? '' : 's'}` : 'Catálogo'} · solo los publicados se ven en el sitio.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/productos/nuevo')}>
          <Plus className="size-4" /> Nuevo producto
        </Button>
      </header>

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar por estado">
        {ESTADOS.map((e) => (
          <Button key={e.valor} role="tab" aria-selected={estado === e.valor} variant={estado === e.valor ? 'secondary' : 'ghost'} size="sm" onClick={() => setEstado(e.valor)}>
            {e.texto}
          </Button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudo cargar el catálogo. Verifica la conexión con el servidor.
        </p>
      ) : loading && !data ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">Cargando catálogo…</div>
      ) : (
        <DataTable
          columns={columnas(nombreCategoria, (id) => navigate(`/admin/productos/${id}/editar`), eliminar)}
          data={data?.productos ?? []}
          searchColumn="nombre"
          searchPlaceholder="Buscar por nombre…"
        />
      )}
    </div>
  )
}
