import client from '@/api/client'

export interface ProductoExtraido {
  nombre: string
  descripcion_sugerida: string | null
  categoria_id_sugerida: string | null
  categoria_nombre: string | null
  confianza: number
}

export interface ResultadoExtraccion {
  total_paginas: number
  productos: ProductoExtraido[]
  advertencias: string[]
}

export async function extraerProductosDePdf(
  archivo: File
): Promise<ResultadoExtraccion> {
  const form = new FormData()
  form.append('file', archivo)
  const { data } = await client.post<ResultadoExtraccion>(
    '/admin/importar-pdf',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function importarProductosBatch(
  productos: { nombre: string; descripcion: string; categorias: string[] }[]
): Promise<void> {
  await client.post('/productos/batch', productos)
}
