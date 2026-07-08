/**
 * LeadWidget — tab pegado al borde derecho de la pantalla.
 * Al hacer click se despliega un mini-formulario de contacto.
 */
import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { leadsService } from '@/services/leads'

export function LeadWidget() {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim()) return
    setLoading(true)
    try {
      await leadsService.crear({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        origen: 'widget_lateral',
      })
      setEnviado(true)
    } catch {
      // fallo silencioso
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center">
      {/* Panel desplegable */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'w-72 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div className="w-72 rounded-l-2xl border border-r-0 bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 rounded-tl-2xl">
            <p className="text-sm font-semibold text-primary-foreground">
              ¿Te ayudamos?
            </p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground transition-colors"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {enviado ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </div>
                <p className="text-sm font-medium text-foreground">¡Gracias! Te llamamos pronto.</p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                  Déjanos tu número y un asesor te contacta para ayudarte con tu pedido.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Tu nombre *"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                  <input
                    type="tel"
                    placeholder="Tu teléfono *"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading}
                    className="mt-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {loading ? 'Enviando...' : 'Que me llamen'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center gap-1 bg-primary text-primary-foreground px-2 py-4 rounded-l-xl shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Abrir formulario de contacto"
        >
          <ChevronLeft className="size-4" />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            Contacto
          </span>
        </button>
      )}
    </div>
  )
}
