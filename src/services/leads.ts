import client from '@/api/client'

export interface LeadPayload {
  nombre: string
  telefono: string
  email?: string
  origen: 'popup' | 'whatsapp' | 'widget_lateral' | 'footer_newsletter'
  notas?: string
}

export type EstadoLead = 'nuevo' | 'contactado' | 'cerrado'

export interface LeadResponse {
  id: string
  nombre: string
  telefono: string
  email?: string
  origen: string
  notas?: string
  fecha: string
  estado: EstadoLead
}

export const leadsService = {
  crear: (data: LeadPayload) =>
    client.post('/leads', data).then((r) => r.data),
}

// ── Admin ──────────────────────────────────────────────────────────────────

export async function listarLeads(): Promise<LeadResponse[]> {
  const { data } = await client.get<LeadResponse[]>('/admin/leads')
  return data
}

export async function actualizarEstadoLead(
  id: string,
  estado: EstadoLead
): Promise<LeadResponse> {
  const { data } = await client.patch<LeadResponse>(`/admin/leads/${id}`, { estado })
  return data
}
