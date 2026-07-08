import client from '@/api/client'
import type { CartItem } from '@/store/carritoStore'

export interface ClienteData {
  nombre: string
  telefono: string
  email: string
  notas?: string
}

export interface CotizacionPayload {
  cliente: ClienteData
  detalle: {
    id_producto: string
    nombre_producto: string
    variante_seleccionada: string | null
    cantidad: number
  }[]
}

export type EstadoCotizacion = 'pendiente' | 'contactado' | 'cerrada' | 'perdida'

export interface CotizacionResponse {
  id: string
  fecha: string
  estado: EstadoCotizacion
  cliente: ClienteData
  detalle: {
    id_producto: string
    nombre_producto: string
    variante_seleccionada: string | null
    cantidad: number
    precio_unitario: number | null
  }[]
}

export function buildPayload(cliente: ClienteData, items: CartItem[]): CotizacionPayload {
  return {
    cliente,
    detalle: items.map((i) => ({
      id_producto: i.id_producto,
      nombre_producto: i.nombre,
      variante_seleccionada: i.variante_seleccionada,
      cantidad: i.cantidad,
    })),
  }
}

export async function enviarCotizacion(payload: CotizacionPayload): Promise<CotizacionResponse> {
  const { data } = await client.post<CotizacionResponse>('/cotizaciones/', payload)
  return data
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function listarCotizaciones(): Promise<CotizacionResponse[]> {
  const { data } = await client.get<CotizacionResponse[]>('/cotizaciones/')
  return data
}

export async function actualizarEstado(
  id: string,
  estado: EstadoCotizacion
): Promise<CotizacionResponse> {
  const { data } = await client.patch<CotizacionResponse>(`/cotizaciones/${id}`, { estado })
  return data
}
