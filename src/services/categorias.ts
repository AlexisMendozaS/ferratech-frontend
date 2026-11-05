import client from '@/api/client'
import type { Categoria, EstadoCategoria } from '@/types/categoria'

export interface CategoriaPayload {
  nombre: string
  slug?: string | null
  padre?: string | null
  descripcion?: string | null
  imagen?: string | null
  orden?: number
  meta_titulo?: string | null
  meta_descripcion?: string | null
  estado?: EstadoCategoria
}

export const categoriasService = {
  /** Públicas (activas). El panel pide también las ocultas. */
  listar: (incluirOcultas = false) =>
    client
      .get<Categoria[]>('/categorias/', { params: incluirOcultas ? { incluir_ocultas: true } : undefined })
      .then((r) => r.data),

  /** Por id o por slug. */
  obtener: (idOSlug: string) =>
    client.get<Categoria>(`/categorias/${encodeURIComponent(idOSlug)}`).then((r) => r.data),

  crear: (data: CategoriaPayload) => client.post<Categoria>('/categorias/', data).then((r) => r.data),

  actualizar: (id: string, data: Partial<CategoriaPayload>) =>
    client.put<Categoria>(`/categorias/${id}`, data).then((r) => r.data),

  eliminar: (id: string) => client.delete(`/categorias/${id}`).then((r) => r.data),
}
