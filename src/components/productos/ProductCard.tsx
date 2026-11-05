import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Disponibilidad, ProductoTarjeta } from '@/types/producto'

interface Props {
  producto: ProductoTarjeta
}

const ETIQUETA_DISPONIBILIDAD: Partial<Record<Disponibilidad, string>> = {
  bajo_pedido: 'Bajo pedido',
  descontinuado: 'Descontinuado',
}

/**
 * Tarjeta de producto. Sin precio, marca ni proveedor (DEC-012): el cliente elige la variante
 * en el detalle y pide su cotización.
 */
export function ProductCard({ producto }: Props) {
  const url = `/producto/${producto.slug}`
  const etiqueta = ETIQUETA_DISPONIBILIDAD[producto.disponibilidad]

  return (
    <article className="group flex flex-col rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link to={url} className="block aspect-square overflow-hidden bg-muted relative">
        {producto.imagen ? (
          <img
            src={producto.imagen.url}
            alt={producto.imagen.alt || producto.nombre}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
            <svg className="size-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {etiqueta && (
          <span className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px]">
              {etiqueta}
            </Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to={url} className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">
          {producto.nombre}
        </Link>
        {producto.descripcion_corta && (
          <p className="text-xs text-muted-foreground line-clamp-2">{producto.descripcion_corta}</p>
        )}
        <p className="text-xs font-medium text-primary">
          Cotiza sin costo{producto.num_variantes > 1 ? ` · ${producto.num_variantes} opciones` : ''}
        </p>

        <Button asChild size="sm" className="mt-auto w-full gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to={url}>
            {producto.num_variantes > 1 ? 'Ver opciones' : 'Ver producto'}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-1" />
        <Skeleton className="h-8 w-full mt-auto" />
      </div>
    </div>
  )
}
