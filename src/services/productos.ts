import client from '@/api/client'
import type { Producto, ProductoCreate, ProductoUpdate } from '@/types/producto'

export const productosService = {
  listar: (limit = 20, offset = 0) =>
    client
      .get<Producto[]>('/productos/', { params: { limit, offset } })
      .then((r) => r.data),

  obtener: (id: string) =>
    client.get<Producto>(`/productos/${id}`).then((r) => r.data),

  crear: (data: ProductoCreate) =>
    client.post<Producto>('/productos/', data).then((r) => r.data),

  actualizar: (id: string, data: ProductoUpdate) =>
    client.put<Producto>(`/productos/${id}`, data).then((r) => r.data),

  eliminar: (id: string) =>
    client.delete(`/productos/${id}`).then((r) => r.data),

  subirImagen: (id: string, file: File) => {
    const form = new FormData()
    form.append('imagen', file)
    return client
      .post<{ url: string }>(`/productos/${id}/imagen`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
