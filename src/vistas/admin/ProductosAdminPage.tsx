import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { CircleAlert, Package, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { CargandoFilas, EncabezadoPanel, EstadoError, EstadoVacio, EtiquetaEstado, FiltroChips, type Tono } from '@/components/admin/panel'
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

const ESTADO: Record<EstadoProducto, { texto: string; tono: Tono }> = {
  publicado: { texto: 'Publicado', tono: 'exito' },
  borrador: { texto: 'Borrador', tono: 'nuevo' },
  archivado: { texto: 'Archivado', tono: 'neutro' },
}

function columnas(categoria: (id: string | null) => string, onEdit: (id: string) => void, onDelete: (p: ProductoAdmin) => void): ColumnDef<ProductoAdmin>[] {
  return [
    {
      id: 'imagen',
      header: '',
      cell: ({ row }) => {
        const img = row.original.galeria[0]
        return img ? (
          <img src={img.url} alt="" className="size-10 rounded-md border bg-white object-contain" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">—</div>
        )
      },
      enableSorting: false,
      meta: { className: 'hidden sm:table-cell w-14' },
    },
    {
      accessorKey: 'nombre',
      header: 'Producto',
      meta: { className: 'whitespace-normal min-w-40' },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <button type="button" className="text-left font-medium hover:underline" onClick={() => onEdit(row.original.id)}>
            {row.original.nombre}
          </button>
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
      meta: { className: 'hidden md:table-cell' },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex flex-col items-start gap-1">
            <EtiquetaEstado texto={ESTADO[p.estado].texto} tono={ESTADO[p.estado].tono} />
            {p.estado !== 'publicado' && p.faltantes_para_publicar.length > 0 && (
              <span title={`Para publicar falta: ${p.faltantes_para_publicar.join(', ')}`} className="flex items-center gap-1 text-xs text-amber-800">
                <CircleAlert className="size-3.5" aria-hidden />
                Faltan {p.faltantes_para_publicar.length} dato{p.faltantes_para_publicar.length === 1 ? '' : 's'}
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
  // Se pide todo una vez y se filtra aquí: así los filtros muestran cuántos hay de cada estado.
  const { data, loading, error } = useAsyncData(() => adminProductosService.listar({ limit: 100 }), `admin-productos:${version}`)
  const total = (e: EstadoProducto) => data?.productos.filter((p) => p.estado === e).length
  const visibles = (data?.productos ?? []).filter((p) => !estado || p.estado === estado)
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
    <div className="space-y-5">
      <EncabezadoPanel
        titulo="Productos"
        descripcion="Solo los publicados se ven en el sitio. A un borrador le falta lo que dice debajo de su estado."
        acciones={
          <Button onClick={() => navigate('/admin/productos/nuevo')}>
            <Plus className="size-4" /> Nuevo producto
          </Button>
        }
      />

      <FiltroChips
        etiqueta="Filtrar por estado"
        valor={estado}
        onCambio={setEstado}
        opciones={ESTADOS.map((e) => ({ valor: e.valor, texto: e.texto, total: e.valor ? total(e.valor) : data?.productos.length }))}
      />

      {error ? (
        <EstadoError texto="No se pudo cargar el catálogo. Revisa la conexión con el servidor." onReintentar={() => setVersion((v) => v + 1)} />
      ) : loading && !data ? (
        <CargandoFilas />
      ) : data && data.productos.length === 0 ? (
        <EstadoVacio
          icono={Package}
          titulo="El catálogo está vacío"
          texto="Da de alta el primer producto. Se publica cuando tiene categoría, descripciones, una imagen y una variante."
          accion={
            <Button onClick={() => navigate('/admin/productos/nuevo')}>
              <Plus className="size-4" /> Nuevo producto
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columnas(nombreCategoria, (id) => navigate(`/admin/productos/${id}/editar`), eliminar)}
          data={visibles}
          searchColumn="nombre"
          searchPlaceholder="Buscar por nombre…"
        />
      )}
    </div>
  )
}
