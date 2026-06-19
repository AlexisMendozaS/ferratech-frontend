import client from '@/api/client'
import type { Categoria } from '@/types/categoria'

export interface CategoriaPayload {
  nombre: string
  descripcion?: string | null
  imagen?: string | null
}

export const categoriasService = {
  listar: () =>
    client.get<Categoria[]>('/categorias/').then((r) => r.data),

  crear: (data: CategoriaPayload) =>
    client.post<Categoria>('/categorias/', data).then((r) => r.data),

  actualizar: (id: string, data: Partial<CategoriaPayload>) =>
    client.put<Categoria>(`/categorias/${id}`, data).then((r) => r.data),

  eliminar: (id: string) =>
    client.delete(`/categorias/${id}`).then((r) => r.data),
}
