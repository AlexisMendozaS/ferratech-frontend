/** Rutas de ADMINISTRACIÓN de productos (requieren sesión). Incluyen el bloque `interno`. */
import client from '@/api/client'
import type { EstadoProducto, PaginaProductosAdmin, ProductoAdmin, ProductoEntrada } from '@/types/producto'

export interface ListarAdminParams {
  q?: string
  estado?: EstadoProducto
  page?: number
  limit?: number
}

export const adminProductosService = {
  listar: (params: ListarAdminParams = {}) =>
    client.get<PaginaProductosAdmin>('/admin/productos', { params }).then((r) => r.data),

  obtener: (id: string) => client.get<ProductoAdmin>(`/admin/productos/${id}`).then((r) => r.data),

  crear: (data: ProductoEntrada) => client.post<ProductoAdmin>('/admin/productos', data).then((r) => r.data),

  reemplazar: (id: string, data: ProductoEntrada) =>
    client.put<ProductoAdmin>(`/admin/productos/${id}`, data).then((r) => r.data),

  eliminar: (id: string) => client.delete(`/admin/productos/${id}`).then((r) => r.data),

  subirImagen: (file: File) => {
    const form = new FormData()
    form.append('imagen', file)
    return client.post<{ url: string }>('/admin/imagenes', form).then((r) => r.data.url)
  },
}

/** Mensajes legibles de un error de la API (422 trae una lista de motivos o de errores de validación). */
export function motivosDeError(error: unknown): string[] {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === 'string') return [detail]
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'string' ? d : (d as { msg?: string })?.msg ?? 'Dato no válido'))
  }
  return ['No se pudo completar la operación. Intenta de nuevo.']
}
