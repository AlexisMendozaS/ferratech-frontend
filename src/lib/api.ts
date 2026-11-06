/**
 * Lectura de la API pública desde las páginas Astro (en el servidor) y desde las islas.
 * Solo rutas públicas: nada de esto lleva marca, proveedor ni precio (DEC-012).
 */
import type { Categoria } from '@/types/categoria'
import type { PaginaProductos, ProductoPublico, Sugerencias } from '@/types/producto'

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export class ErrorApi extends Error {
  estado: number
  constructor(estado: number, ruta: string) {
    super(`La API respondió ${estado} en ${ruta}`)
    this.estado = estado
  }
}

/**
 * En el servidor, todas las páginas piden a la API desde las mismas máquinas de Vercel. Con el
 * secreto `SITIO_TOKEN` (el mismo en el backend) el sitio le dice al backend la IP del cliente que
 * pidió la página, para que el límite de peticiones se cuente por cliente y no bloquee a todos.
 * La IP la deja el middleware (`src/middleware.ts`) para cada petición.
 */
function cabecerasDelServidor(): Record<string, string> {
  if (!import.meta.env.SSR) return {}
  const token = process.env.SITIO_TOKEN
  const ip = (globalThis as { __ferratechCliente?: { getStore(): string | undefined } }).__ferratechCliente?.getStore()
  return token && ip ? { 'x-ferratech-sitio': token, 'x-ferratech-cliente': ip } : {}
}

async function pedir<T>(ruta: string, params?: Record<string, string | number | undefined | null>): Promise<T | null> {
  const url = new URL(API_URL + ruta)
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }
  // Identifica al sitio ante el filtro antiscraping del backend (en el navegador se ignora).
  const r = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'FerraTech-Web/1.0 (Astro)', ...cabecerasDelServidor() },
  })
  if (r.status === 404) return null
  if (!r.ok) throw new ErrorApi(r.status, ruta)
  return (await r.json()) as T
}

export const api = {
  buscar: (p: { q?: string | null; categoria?: string | null; page?: number; limit?: number }) =>
    pedir<PaginaProductos>('/productos/buscar', p) as Promise<PaginaProductos>,

  /** Por slug, slug anterior o id. `null` si no existe o no está publicado. */
  producto: (idOSlug: string) => pedir<ProductoPublico>(`/productos/${encodeURIComponent(idOSlug)}`),

  categorias: () => pedir<Categoria[]>('/categorias/') as Promise<Categoria[]>,

  /** Por slug o id. `null` si no existe. */
  categoria: (idOSlug: string) => pedir<Categoria>(`/categorias/${encodeURIComponent(idOSlug)}`),

  sugerir: (q: string) => pedir<Sugerencias>('/productos/sugerir', { q }) as Promise<Sugerencias>,
}

/** Secciones (sin padre) con sus familias, en el orden del catálogo. */
export function arbolDeCategorias(categorias: Categoria[]) {
  const orden = (a: Categoria, b: Categoria) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es')
  return categorias
    .filter((c) => !c.padre)
    .sort(orden)
    .map((seccion) => ({ ...seccion, familias: categorias.filter((c) => c.padre === seccion.id).sort(orden) }))
}
