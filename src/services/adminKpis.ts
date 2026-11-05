/** KPIs del panel (INI-009): espejo de `app/services/kpis.py`. */
import client from '@/api/client'

export type Periodo = 7 | 30 | 90

export interface Comparado {
  actual: number
  anterior: number
}

export interface Kpis {
  dias: Periodo
  desde: string
  hasta: string
  embudo: { etapa: string; actual: number; anterior: number }[]
  cotizaciones: {
    nuevas: Comparado
    sin_responder: number
    respuesta_mediana_horas: number | null
    ganadas: Comparado
    perdidas: number
    tasa_ganadas: number | null
    monto_ganado: Comparado
  }
  demanda_no_cubierta: { termino: string; veces: number; sin_resultado: number }[]
  busquedas_frecuentes: { termino: string; veces: number; sin_resultado: number }[]
  productos_mas_vistos: { slug: string | null; id: string | null; nombre: string; veces: number }[]
  productos_mas_cotizados: { slug: string | null; id: string | null; nombre: string; veces: number }[]
  cotizaciones_por_estado: { nombre: string; total: number; convertidos: number }[]
  contactos_por_origen: { nombre: string; total: number; convertidos: number }[]
}

export const adminKpisService = {
  obtener: (dias: Periodo) => client.get<Kpis>('/admin/kpis', { params: { dias } }).then((r) => r.data),
}
