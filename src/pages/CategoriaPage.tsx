import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard, ProductCardSkeleton } from '@/components/productos/ProductCard'
import { Seo } from '@/components/seo/Seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { categoriasService } from '@/services/categorias'
import { productosService } from '@/services/productos'
import { useAsyncData } from '@/hooks/useAsyncData'

const LIMIT = 12

export default function CategoriaPage() {
  const { id } = useParams<{ id: string }>()

  // Al cambiar de categoría se vuelve a la página 1 (ajuste durante el render, sin efecto).
  const [page, setPage] = useState(1)
  const [idAnterior, setIdAnterior] = useState(id)
  if (idAnterior !== id) {
    setIdAnterior(id)
    setPage(1)
  }

  const {
    data: categoria,
    loading: loadingCat,
    error: errorCat,
  } = useAsyncData(() => categoriasService.obtener(id!), `categoria:${id}`, !!id)
  const notFound = !!errorCat

  const { data: result, loading: loadingProds } = useAsyncData(
    () => productosService.buscar({ categoria: id, page, limit: LIMIT }),
    `productos:${id}:${page}`,
    !!id,
  )

  // Not found
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <LayoutGrid className="size-16 text-muted-foreground/30" />
        <p className="text-lg font-semibold">Categoría no encontrada</p>
        <Button asChild variant="outline">
          <Link to="/categorias">Ver todas las categorías</Link>
        </Button>
      </div>
    )
  }

  const totalPages = result ? Math.ceil(result.total / LIMIT) : 0

  return (
    <div>
      <Seo
        title={categoria?.nombre}
        description={
          categoria?.descripcion
            ? `${categoria.descripcion} — Explora los productos de FerraTech en esta categoría.`
            : `Productos de ${categoria?.nombre ?? 'esta categoría'} en FerraTech. Solicita tu cotización en línea.`
        }
        image={categoria?.imagen ?? undefined}
      />
      {categoria && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://ferratech.com.mx/' },
              { '@type': 'ListItem', position: 2, name: 'Categorías', item: 'https://ferratech.com.mx/categorias' },
              { '@type': 'ListItem', position: 3, name: categoria.nombre, item: `https://ferratech.com.mx/categorias/${categoria.id}` },
            ],
          }}
        />
      )}
      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden bg-primary h-48 sm:h-64">
        {categoria?.imagen && (
          <img
            src={categoria.imagen}
            alt={categoria.nombre}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-6 sm:px-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/categorias" className="hover:text-primary-foreground transition-colors">Categorías</Link>
            <span>/</span>
            <span className="text-primary-foreground/90">
              {loadingCat ? <Skeleton className="inline-block h-3 w-20 bg-white/20" /> : categoria?.nombre}
            </span>
          </nav>

          {loadingCat ? (
            <Skeleton className="h-9 w-48 bg-white/20" />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-black text-primary-foreground">
              {categoria?.nombre}
            </h1>
          )}

          {categoria?.descripcion && (
            <p className="mt-1 text-sm text-primary-foreground/70 max-w-lg">
              {categoria.descripcion}
            </p>
          )}
        </div>
      </section>

      {/* ── Productos ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loadingProds ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : result ? (
              `${result.total} producto${result.total !== 1 ? 's' : ''}`
            ) : null}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to={`/productos?categoria=${id}`}>Ver en página de Productos</Link>
          </Button>
        </div>

        {/* Grid */}
        {!loadingProds && result?.productos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
            <LayoutGrid className="size-14 opacity-20" />
            <p className="font-medium">No hay productos en esta categoría todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {loadingProds
              ? Array(LIMIT).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
              : result?.productos.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Paginación">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p =
                totalPages <= 5
                  ? i + 1
                  : page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                  ? totalPages - 4 + i
                  : page - 2 + i
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  )
}
