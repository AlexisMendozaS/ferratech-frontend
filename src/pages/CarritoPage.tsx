import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ModalCotizacion } from '@/components/cotizacion/ModalCotizacion'
import { Seo } from '@/components/seo/Seo'
import { useCarritoStore } from '@/store/carritoStore'

export default function CarritoPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const items = useCarritoStore((s) => s.items)
  const removeItem = useCarritoStore((s) => s.removeItem)
  const updateQuantity = useCarritoStore((s) => s.updateQuantity)
  const totalItems = useCarritoStore((s) => s.totalItems)

  const totalCount = totalItems()

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto mb-4 size-16 text-muted-foreground/40" />
        <h1 className="mb-2 text-2xl font-bold">Tu carrito esta vacio</h1>
        <p className="mb-8 text-muted-foreground">
          Agrega productos al carrito para solicitar una cotizacion.
        </p>
        <Button asChild>
          <Link to="/productos">Explorar productos</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Seo title="Carrito de Cotización" noindex />
      <h1 className="mb-6 text-2xl font-bold">
        Carrito{' '}
        <Badge variant="secondary" className="ml-2 text-sm">
          {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
        </Badge>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lista de items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <article
              key={`${item.id_producto}-${item.variante_seleccionada}`}
              className="flex gap-4 rounded-lg border bg-card p-4"
            >
              {/* Imagen */}
              <div className="size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingCart className="size-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <h2 className="font-semibold leading-tight line-clamp-2">{item.nombre}</h2>
                {item.variante_seleccionada && (
                  <p className="text-sm text-muted-foreground">{item.variante_seleccionada}</p>
                )}

                {/* Controles de cantidad */}
                <div className="mt-auto flex items-center gap-2">
                  <div className="flex items-center rounded-md border">
                    <button
                      aria-label="Reducir cantidad"
                      className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                      onClick={() =>
                        updateQuantity(item.id_producto, item.variante_seleccionada, item.cantidad - 1)
                      }
                      disabled={item.cantidad <= 1}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                    <button
                      aria-label="Aumentar cantidad"
                      className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() =>
                        updateQuantity(item.id_producto, item.variante_seleccionada, item.cantidad + 1)
                      }
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    aria-label="Eliminar del carrito"
                    className="ml-auto flex size-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                    onClick={() => removeItem(item.id_producto, item.variante_seleccionada)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Resumen lateral */}
        <aside className="rounded-lg border bg-card p-6 h-fit space-y-4 lg:sticky lg:top-24">
          <h2 className="font-semibold text-lg">Resumen</h2>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total de productos</span>
            <span className="font-medium">{totalCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Los precios seran confirmados por el agente de ventas al contactarte.
          </p>
          <Separator />
          <Button
            className="w-full"
            size="lg"
            onClick={() => setModalOpen(true)}
          >
            Solicitar cotizacion
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/productos">Seguir explorando</Link>
          </Button>
        </aside>
      </div>

      <ModalCotizacion
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </main>
  )
}
