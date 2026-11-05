/** Rutas PÚBLICAS de productos: solo publicados, sin marca, proveedor ni precio (DEC-012). */
import client from '@/api/client'
import type { PaginaProductos, ProductoPublico, ProductoTarjeta } from '@/types/producto'

export interface BuscarParams {
  q?: string
  /** Id o slug; una sección incluye sus familias. */
  categoria?: string
  page?: number
  limit?: number
}

export const productosService = {
  listar: (limit = 20, offset = 0) =>
    client.get<ProductoTarjeta[]>('/productos/', { params: { limit, offset } }).then((r) => r.data),

  buscar: (params: BuscarParams) =>
    client.get<PaginaProductos>('/productos/buscar', { params }).then((r) => r.data),

  /** Por slug (o un slug anterior, o id). Si `slug` de la respuesta difiere, hay que redirigir. */
  obtener: (idOSlug: string) =>
    client.get<ProductoPublico>(`/productos/${encodeURIComponent(idOSlug)}`).then((r) => r.data),
}
