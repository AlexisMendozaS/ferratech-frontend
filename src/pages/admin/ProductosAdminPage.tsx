import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Plus, Trash2 } from 'lucide-react'

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

import { categoriasService } from '@/services/categorias'
import { productosService } from '@/services/productos'
import type { Categoria } from '@/types/categoria'
import type { Producto } from '@/types/producto'

// ---------------------------------------------------------------------------
// Columnas
// ---------------------------------------------------------------------------

function buildColumns(
  categoriaMap: Map<string, string>,
  onEdit: (id: string) => void,
  onDelete: (producto: Producto) => void
): ColumnDef<Producto>[] {
  return [
    {
      id: 'imagen',
      header: '',
      cell: ({ row }) => {
        const src = row.original.imagen_principal
        return src ? (
          <img
            src={src}
            alt={row.original.nombre}
            className="size-10 rounded-md object-cover border"
          />
        ) : (
          <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
            —
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre}</span>
      ),
    },
    {
      id: 'categorias',
      header: 'Categorías',
      cell: ({ row }) => {
        const nombres = row.original.categorias.map(
          (id) => categoriaMap.get(id) ?? id
        )
        if (!nombres.length) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {nombres.map((n) => (
              <Badge key={n} variant="secondary" className="text-xs">
                {n}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'atributos',
      header: 'Atributos',
      cell: ({ row }) => {
        const attrs = row.original.atributos
        if (!attrs.length) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {attrs.map((a) => (
              <Badge key={a.nombre} variant="outline" className="text-xs">
                {a.nombre} ({a.opciones.length})
              </Badge>
            ))}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'bajo_pedido',
      header: 'Bajo pedido',
      cell: ({ row }) =>
        row.original.bajo_pedido ? (
          <Badge variant="secondary" className="text-xs">Sí</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">No</span>
        ),
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const producto = row.original
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(producto.id)}
              aria-label={`Editar ${producto.nombre}`}
            >
              <Pencil className="size-3.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Eliminar ${producto.nombre}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>{producto.nombre}</strong> se eliminará de forma permanente.
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(producto)}
                  >
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

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function ProductosAdminPage() {
  const navigate = useNavigate()

  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaMap, setCategoriaMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      productosService.listar(100, 0),
      categoriasService.listar(),
    ])
      .then(([prods, cats]) => {
        setProductos(prods)
        setCategoriaMap(new Map(cats.map((c: Categoria) => [c.id, c.nombre])))
      })
      .catch(() => setError('No se pudo cargar el catálogo. Verifica la conexión con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (producto: Producto) => {
    try {
      await productosService.eliminar(producto.id)
      setProductos((prev) => prev.filter((p) => p.id !== producto.id))
    } catch {
      setError(`No se pudo eliminar "${producto.nombre}". Intenta de nuevo.`)
    }
  }

  const columns = buildColumns(
    categoriaMap,
    (id) => navigate(`/admin/productos/${id}/editar`),
    handleDelete
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Administra el catálogo de la tienda.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/productos/nuevo')}>
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Cargando catálogo…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={productos}
          searchColumn="nombre"
          searchPlaceholder="Buscar por nombre…"
        />
      )}
    </div>
  )
}
