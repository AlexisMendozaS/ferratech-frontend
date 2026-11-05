/**
 * Tipos del producto, espejo de `app/schemas/producto.py` del backend.
 * Modelo aprobado: docs/avances/catalogo/modelo_de_producto.md
 *
 * DEC-012: lo PÚBLICO nunca lleva marca, proveedor ni precio. Los tipos públicos
 * (ProductoPublico, ProductoTarjeta) no los declaran; los de administración sí (bloque `interno`).
 */

export const UNIDADES_VENTA = ['pieza', 'kg', 'tonelada', 'metro', 'rollo', 'caja', 'bulto', 'hoja', 'litro', 'juego'] as const
export type UnidadVenta = (typeof UNIDADES_VENTA)[number]

export type Disponibilidad = 'disponible' | 'bajo_pedido' | 'descontinuado'
export type EstadoProducto = 'borrador' | 'publicado' | 'archivado'

export interface Imagen {
  url: string
  alt: string
  orden: number
}

export interface FilaEspecificacion {
  clave: string
  valor: string
  unidad?: string | null
}

export interface GrupoEspecificaciones {
  grupo: string
  filas: FilaEspecificacion[]
}

export interface Eje {
  nombre: string
  opciones: string[]
}

// ── Público ──────────────────────────────────────────────────────────────────

export interface VariantePublica {
  sku: string
  valores: Record<string, string>
  especificaciones: FilaEspecificacion[]
  unidad_venta: UnidadVenta
  venta_minima: number | null
  imagen: string | null
  disponibilidad: Disponibilidad | null
}

export interface ProductoPublico {
  id: string
  slug: string
  nombre: string
  categoria_principal: string | null
  categorias: string[]
  descripcion_corta: string | null
  descripcion: string | null
  ventajas: string[]
  aplicaciones: string[]
  galeria: Imagen[]
  especificaciones: GrupoEspecificaciones[]
  ejes: Eje[]
  variantes: VariantePublica[]
  disponibilidad: Disponibilidad
  alternativas: string[]
  relacionados: string[]
  meta_titulo: string | null
  meta_descripcion: string | null
  actualizado: string | null
}

export interface ProductoTarjeta {
  id: string
  slug: string
  nombre: string
  descripcion_corta: string | null
  imagen: Imagen | null
  categoria_principal: string | null
  disponibilidad: Disponibilidad
  num_variantes: number
}

/**
 * `modo`: «catalogo» (listado sin texto), «resultados» (coincide con lo buscado) o «parecidos»
 * (no hubo coincidencias: son los más cercanos; el sitio ofrece cotizar lo buscado). INI-006.
 */
export interface PaginaProductos {
  total: number
  page: number
  limit: number
  productos: ProductoTarjeta[]
  modo: 'catalogo' | 'resultados' | 'parecidos'
  consulta: string | null
}

/** Autocompletado de la barra de búsqueda (`GET /productos/sugerir`). */
export interface Sugerencias {
  productos: { slug: string; nombre: string }[]
  categorias: { slug: string; nombre: string }[]
}

// ── Administración (incluye el bloque interno, que nunca se publica) ─────────

export interface Proveedor {
  nombre: string
  clave?: string | null
  costo?: number | null
  fecha_costo?: string | null
  notas?: string | null
}

export interface VarianteInterno {
  proveedores: Proveedor[]
  precio_referencia: number | null
}

export interface ProductoInterno {
  marca: string | null
  modelo: string | null
  fabricante: string | null
  fuente: { documento: string; pagina: number | null } | null
  notas: string | null
}

export interface VarianteEntrada extends Omit<VariantePublica, 'sku'> {
  sku: string | null
  interno: VarianteInterno
}

export interface ProductoEntrada {
  nombre: string
  slug: string | null
  categoria_principal: string | null
  categorias: string[]
  descripcion_corta: string | null
  descripcion: string | null
  ventajas: string[]
  aplicaciones: string[]
  galeria: Imagen[]
  especificaciones: GrupoEspecificaciones[]
  ejes: Eje[]
  variantes: VarianteEntrada[]
  disponibilidad: Disponibilidad
  alternativas: string[]
  relacionados: string[]
  sinonimos: string[]
  terminos: string[]
  meta_titulo: string | null
  meta_descripcion: string | null
  estado: EstadoProducto
  interno: ProductoInterno
}

export interface ProductoAdmin extends Omit<ProductoEntrada, 'variantes' | 'slug'> {
  id: string
  slug: string
  slugs_anteriores: string[]
  variantes: (VarianteEntrada & { sku: string })[]
  creado: string | null
  actualizado: string | null
  publicado: string | null
  faltantes_para_publicar: string[]
}

export interface PaginaProductosAdmin {
  total: number
  page: number
  limit: number
  productos: ProductoAdmin[]
}

/** Texto legible de una variante: «Calibre 16 · Acabado liso». */
export function describeVariante(valores: Record<string, string>): string {
  return Object.entries(valores)
    .map(([eje, valor]) => `${eje} ${valor}`)
    .join(' · ')
}
