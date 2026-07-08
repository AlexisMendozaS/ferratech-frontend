/**
 * ExitIntentPopup — aparece cuando el cursor sale por la parte superior
 * de la ventana (intención de cerrar/cambiar pestaña).
 * Se muestra una sola vez por sesión (sessionStorage).
 */
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { leadsService } from '@/services/leads'

const SESSION_KEY = 'ferratech-exit-popup-shown'

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const triggered = useRef(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !triggered.current) {
        triggered.current = true
        sessionStorage.setItem(SESSION_KEY, '1')
        setOpen(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  const handleClose = () => setOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim()) return
    setLoading(true)
    try {
      await leadsService.crear({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim() || undefined,
        origen: 'popup',
      })
      setEnviado(true)
    } catch {
      // fallo silencioso — no interrumpir la experiencia
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1 text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
            ¡Espera!
          </p>
          <h2 className="mt-1 text-2xl font-black leading-tight">
            ¿Buscas el mejor precio?
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/70">
            Déjanos tu contacto y un asesor te ayuda a conseguir lo que necesitas.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
                ✓
              </div>
              <p className="font-semibold text-foreground">¡Listo! Te contactamos pronto.</p>
              <p className="text-sm text-muted-foreground">
                Nuestro equipo se comunicará contigo en breve.
              </p>
              <Button onClick={handleClose} variant="outline" size="sm" className="mt-2">
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              <input
                type="email"
                placeholder="Tu correo (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <Button
                type="submit"
                disabled={loading}
                className="mt-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                {loading ? 'Enviando...' : 'Quiero que me contacten'}
              </Button>
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:underline text-center"
              >
                No gracias, continuar sin asesoría
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
