/**
 * Vista previa de la página completa del producto (INI-003). Abre la ficha real del sitio
 * (`/vista-previa/producto`, la misma que la página pública) en un marco, con lo que hay en el
 * formulario en este momento, sin guardar. Se puede ver como en escritorio o como en celular.
 */
import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Eye, Monitor, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { EstadoProducto } from '@/types/producto'
import { aEntrada, type FormProducto } from './modelo'

const MARCO = 'vista-previa-producto'

/** Envía el formulario oculto al marco en cuanto ambos existen (al abrir el diálogo). */
function Marco({ datos, id, token, ancho }: { datos: string; id?: string; token: string; ancho: 'escritorio' | 'celular' }) {
  const formulario = useRef<HTMLFormElement>(null)
  useEffect(() => {
    formulario.current?.submit()
  }, [])
  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/60 p-3">
      <form ref={formulario} method="post" action="/vista-previa/producto" target={MARCO} className="hidden">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="datos" value={datos} />
        {id && <input type="hidden" name="id" value={id} />}
      </form>
      <iframe
        name={MARCO}
        title="Vista previa de la página del producto"
        className={cn('h-full rounded-lg border bg-white shadow-sm transition-[width]', ancho === 'celular' ? 'w-[390px]' : 'w-full')}
      />
    </div>
  )
}

export function VistaPrevia({ productoId, estado }: { productoId?: string; estado: EstadoProducto }) {
  const { getValues } = useFormContext<FormProducto>()
  const token = useAuthStore((s) => s.token) ?? ''
  const [datos, setDatos] = useState<string | null>(null)
  const [ancho, setAncho] = useState<'escritorio' | 'celular'>('escritorio')

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setDatos(JSON.stringify(aEntrada(getValues(), estado)))}>
        <Eye /> Vista previa
      </Button>
      <Dialog open={datos !== null} onOpenChange={(abierta) => !abierta && setDatos(null)}>
        <DialogContent className="flex h-[94dvh] max-w-[96vw] flex-col gap-0 p-0 sm:max-w-[96vw]">
          <DialogHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b px-4 py-3 pr-12 text-left">
            <div>
              <DialogTitle>Vista previa de la página</DialogTitle>
              <DialogDescription>Así se verá en el sitio con lo que hay ahora en el formulario. No se guarda nada.</DialogDescription>
            </div>
            <div role="group" aria-label="Tamaño de pantalla" className="inline-flex rounded-lg border bg-card p-0.5">
              {(
                [
                  ['escritorio', Monitor, 'Escritorio'],
                  ['celular', Smartphone, 'Celular'],
                ] as const
              ).map(([valor, Icono, texto]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={ancho === valor}
                  onClick={() => setAncho(valor)}
                  className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm', ancho === valor ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
                >
                  <Icono className="size-4" aria-hidden /> {texto}
                </button>
              ))}
            </div>
          </DialogHeader>
          {datos !== null && <Marco datos={datos} id={productoId} token={token} ancho={ancho} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
