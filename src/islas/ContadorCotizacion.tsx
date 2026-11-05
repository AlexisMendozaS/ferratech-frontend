/** Ícono de la cotización con el número de productos agregados. Solo en el navegador (localStorage). */
import { ClipboardList } from 'lucide-react'

import { useCarritoStore } from '@/store/carritoStore'

export default function ContadorCotizacion() {
  const productos = useCarritoStore((s) => s.items.length)
  return (
    <a
      href="/cotizacion"
      aria-label={productos ? `Mi cotización: ${productos} producto(s)` : 'Mi cotización'}
      className="relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-white/10"
    >
      <ClipboardList className="size-5" aria-hidden />
      <span className="hidden sm:inline">Mi cotización</span>
      {productos > 0 && (
        <span className="absolute -top-1 left-5 flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground sm:static sm:size-5">
          {productos > 99 ? '99+' : productos}
        </span>
      )}
    </a>
  )
}
