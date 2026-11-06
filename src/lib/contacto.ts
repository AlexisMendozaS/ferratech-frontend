/**
 * Número de WhatsApp del vendedor en formato internacional para `wa.me` (52 + 10 dígitos).
 * `VITE_WHATSAPP_NUMBER` puede venir con o sin lada de país: un número de 10 dígitos se toma
 * como mexicano. `null` si no está configurado.
 *
 * Con `telefono`, normaliza ese número (el panel lo usa para escribirle al cliente por WhatsApp).
 */
export function numeroWhatsApp(telefono: string = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''): string | null {
  const n = telefono.replace(/\D/g, '')
  if (n.length === 10) return `52${n}`
  return n.length >= 11 ? n : null
}
