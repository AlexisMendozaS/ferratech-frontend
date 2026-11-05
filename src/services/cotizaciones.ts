import client from '@/api/client'
import type { CartItem } from '@/store/carritoStore'

export interface ClienteData {
  nombre: string
  telefono: string
  email: string
  notas?: string
  /** Estado de la República de la obra (opcional, INI-009). */
  estado_republica?: string
}

export interface CotizacionPayload {
  cliente: ClienteData
  detalle: {
    id_producto: string
    nombre_producto: string
    variante_seleccionada: string | null
    sku: string | null
    unidad_venta: string | null
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
  /** Monto de la venta ganada (interno). */
  monto: number | null
  fecha_primera_respuesta: string | null
}

export function buildPayload(cliente: ClienteData, items: CartItem[]): CotizacionPayload {
  return {
    cliente,
    detalle: items.map((i) => ({
      id_producto: i.id_producto,
      nombre_producto: i.nombre,
      variante_seleccionada: i.variante_seleccionada,
      sku: i.sku ?? null,
      unidad_venta: i.unidad_venta ?? null,
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

/** Monto de la venta ganada (KPI de INI-009; nunca es público). */
export async function actualizarMonto(id: string, monto: number): Promise<CotizacionResponse> {
  const { data } = await client.patch<CotizacionResponse>(`/cotizaciones/${id}`, { monto })
  return data
}
