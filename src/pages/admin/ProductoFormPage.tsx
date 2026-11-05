import { useParams } from 'react-router-dom'

import { FormularioProducto } from '@/components/admin/producto/FormularioProducto'
import { useAsyncData } from '@/hooks/useAsyncData'
import { adminProductosService } from '@/services/adminProductos'
import { categoriasService } from '@/services/categorias'

export default function ProductoFormPage() {
  const { id } = useParams<{ id: string }>()
  const { data: producto, loading: cargandoProducto, error } = useAsyncData(
    () => adminProductosService.obtener(id!),
    `admin-producto:${id}`,
    !!id,
  )
  const { data: categorias, loading: cargandoCategorias } = useAsyncData(() => categoriasService.listar(true), 'admin-categorias')

  if ((id && cargandoProducto) || cargandoCategorias) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Cargando…</div>
  }
  if (id && (error || !producto)) {
    return <div className="flex h-64 items-center justify-center text-destructive">No se pudo cargar el producto.</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* `key` reinicia el formulario al cambiar de producto (p. ej. tras crear uno nuevo). */}
      <FormularioProducto key={producto?.id ?? 'nuevo'} producto={producto ?? undefined} categorias={categorias ?? []} />
    </div>
  )
}
