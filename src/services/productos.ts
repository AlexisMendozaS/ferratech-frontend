/** Rutas PÚBLICAS de productos: solo publicados, sin marca, proveedor ni precio (DEC-012). */
import client from '@/api/client'
import type { PaginaProductos, ProductoPublico, ProductoTarjeta, Sugerencias } from '@/types/producto'

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

  /** Búsqueda híbrida: con texto nunca viene vacía; `modo: 'parecidos'` = sin coincidencias exactas. */
  buscar: (params: BuscarParams) =>
    client.get<PaginaProductos>('/productos/buscar', { params }).then((r) => r.data),

  /** Autocompletado de la barra de búsqueda. */
  sugerir: (q: string) =>
    client.get<Sugerencias>('/productos/sugerir', { params: { q } }).then((r) => r.data),

  /** Por slug (o un slug anterior, o id). Si `slug` de la respuesta difiere, hay que redirigir. */
  obtener: (idOSlug: string) =>
    client.get<ProductoPublico>(`/productos/${encodeURIComponent(idOSlug)}`).then((r) => r.data),
}
