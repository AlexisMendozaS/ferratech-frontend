/**
 * Obtiene los contadores del panel admin desde GET /admin/stats.
 * Si el endpoint no existe todavía, devuelve null silenciosamente.
 */
import { useEffect, useState } from 'react'
import client from '@/api/client'

export interface AdminStats {
  cotizaciones_pendientes: number
  leads_nuevos: number
  total_productos: number
  total_categorias: number
  cotizaciones_hoy: number
  cotizaciones_semana: number
  cotizaciones_mes: number
  leads_semana: number
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    client
      .get<AdminStats>('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => {
        // Silencioso — el endpoint puede no existir aún
      })
  }, [])

  return stats
}
