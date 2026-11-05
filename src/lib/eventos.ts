/**
 * Eventos del sitio público para los KPIs del panel (INI-009). Sin datos personales: la sesión
 * es un número aleatorio por pestaña (sessionStorage) y se pierde al cerrarla.
 * Nunca interrumpe al cliente: si falla, no pasa nada.
 */
import { API_URL } from '@/lib/api'

type TipoEvento = 'visita' | 'vista_producto' | 'clic_busqueda' | 'agregar_cotizacion'

interface Datos {
  ruta?: string
  producto?: string
  q?: string
  posicion?: number
}

function sesion(): string {
  try {
    let id = sessionStorage.getItem('ft-sesion')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('ft-sesion', id)
    }
    return id
  } catch {
    return 'sin-almacenamiento'
  }
}

export function registrarEvento(tipo: TipoEvento, datos: Datos = {}): void {
  if (typeof window === 'undefined') return
  try {
    void fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, sesion: sesion(), ...datos }),
      keepalive: true, // llega aunque el cliente ya esté cambiando de página
    }).catch(() => {})
  } catch {
    // sin red o sin fetch: el evento se pierde
  }
}
