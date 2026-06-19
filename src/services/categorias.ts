import client from '@/api/client'
import type { Categoria } from '@/types/categoria'

export const categoriasService = {
  listar: () =>
    client.get<Categoria[]>('/categorias/').then((r) => r.data),
}
