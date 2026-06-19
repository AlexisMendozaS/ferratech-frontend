import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Producto } from '@/types/producto'

interface Props {
  producto: Producto
}

export function ProductCard({ producto }: Props) {
  return (
    <article className="group flex flex-col rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Imagen */}
      <Link to={`/producto/${producto.id}`} className="block aspect-square overflow-hidden bg-muted relative">
        {producto.imagen_principal ? (
          <img
            src={producto.imagen_principal}
            alt={producto.nombre}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
            <svg className="size-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {producto.bajo_pedido && (
          <span className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px]">
              Bajo pedido
            </Badge>
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          to={`/producto/${producto.id}`}
          className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight"
        >
          {producto.nombre}
        </Link>

        {producto.precio != null ? (
          <p className="text-base font-bold text-foreground">
            ${producto.precio.toLocaleString('es-MX')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">Consultar precio</p>
        )}

        <Button
          size="sm"
          className="mt-auto w-full gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={(e) => {
            e.preventDefault()
            // TODO: Zustand cart T-20
          }}
        >
          <ShoppingCart className="size-3.5" />
          Añadir al Carrito
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
