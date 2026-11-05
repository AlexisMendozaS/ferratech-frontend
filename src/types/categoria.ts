/** Espejo de `app/schemas/categoria.py`: sección (sin padre) → familia (con padre). */
export type EstadoCategoria = 'activa' | 'oculta'

export interface Categoria {
  id: string
  slug: string
  nombre: string
  padre: string | null
  descripcion: string | null
  imagen: string | null
  orden: number
  meta_titulo: string | null
  meta_descripcion: string | null
  estado: EstadoCategoria
}
