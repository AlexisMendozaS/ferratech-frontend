/** Número de WhatsApp del vendedor (521XXXXXXXXXX). `null` si no está configurado. */
export function numeroWhatsApp(): string | null {
  const n = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  return n.length >= 10 ? n : null
}
