/** Fechas del panel en español de México. */

export const fmtFecha = (iso: string) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export const fmtFechaHora = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

/** «hace 3 h», «hace 2 días»: para ver de un vistazo cuánto lleva esperando un cliente. */
export function haceCuanto(iso: string, ahora = Date.now()): string {
  const minutos = Math.max(0, Math.round((ahora - new Date(iso).getTime()) / 60000))
  if (minutos < 1) return 'hace un momento'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 48) return `hace ${horas} h`
  return `hace ${Math.round(horas / 24)} días`
}
