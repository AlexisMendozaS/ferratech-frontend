import type { ComponentProps, ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CampoProps {
  id: string
  etiqueta: string
  ayuda?: ReactNode
  obligatorio?: boolean
  /** Muestra «n / max» y lo marca si se pasa. */
  contador?: { actual: number; max: number }
  children: ReactNode
  className?: string
}

export function Campo({ id, etiqueta, ayuda, obligatorio, contador, children, className }: CampoProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>
          {etiqueta}
          {obligatorio && <span className="text-destructive" aria-hidden="true"> *</span>}
        </Label>
        {contador && (
          <span className={cn('text-xs tabular-nums', contador.actual > contador.max ? 'text-destructive' : 'text-muted-foreground')}>
            {contador.actual}/{contador.max}
          </span>
        )}
      </div>
      {children}
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  )
}

export function Seleccion({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export function Seccion({ titulo, descripcion, children, accion }: { titulo: string; descripcion?: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
        </div>
        {accion}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
