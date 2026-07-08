import client from '@/api/client'

export interface LeadPayload {
  nombre: string
  telefono: string
  email?: string
  origen: 'popup' | 'whatsapp' | 'widget_lateral' | 'footer_newsletter'
  notas?: string
}

export const leadsService = {
  crear: (data: LeadPayload) =>
    client.post('/leads', data).then((r) => r.data),
}
