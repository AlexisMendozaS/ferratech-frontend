import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ProductCard, ProductCardSkeleton } from '@/components/productos/ProductCard'
import { productosService } from '@/services/productos'
import { categoriasService } from '@/services/categorias'
import type { Categoria } from '@/types/categoria'
import type { PaginatedProductoResponse } from '@/types/producto'

const LIMIT = 12

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <svg className="size-20 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="text-lg font-semibold text-foreground">
          {query ? `Sin resultados para "${query}"` : 'No hay productos disponibles'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Intenta con otros términos o elimina los filtros activos.
        </p>
      </div>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <nav className="flex items-center justify-center gap-1 pt-8" aria-label="Paginación">
      <Button
        variant="outline"
        size="icon"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Página anterior"
        className="size-8"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages[0] > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onChange(1)} className="size-8">1</Button>
          {pages[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(p)}
          className="size-8"
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </Button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Button variant="outline" size="sm" onClick={() => onChange(totalPages)} className="size-8">{totalPages}</Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Página siguiente"
        className="size-8"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}

export default function ProductosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const categoriaParam = searchParams.get('categoria') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [resultado, setResultado] = useState<PaginatedProductoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Temp state for sidebar (committed on "Aplicar Filtros")
  const [categoriaTemp, setCategoriaTemp] = useState(categoriaParam)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  // Sync temp state when URL changes externally (e.g. Navbar search)
  useEffect(() => {
    setCategoriaTemp(categoriaParam)
  }, [categoriaParam])

  // Load categories once
  useEffect(() => {
    categoriasService.listar().then(setCategorias).catch(() => {})
  }, [])

  // Fetch products whenever URL params change
  const fetchProductos = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(false)
    try {
      const data = await productosService.buscar({
        q: q || undefined,
        categoria: categoriaParam || undefined,
        page,
        limit: LIMIT,
      })
      setResultado(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [q, categoriaParam, page])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams)
    if (categoriaTemp) {
      next.set('categoria', categoriaTemp)
    } else {
      next.delete('categoria')
    }
    next.delete('page')
    setSearchParams(next)
    setSidebarOpen(false)
  }

  const clearFilters = () => {
    setCategoriaTemp('')
    const next = new URLSearchParams(searchParams)
    next.delete('categoria')
    next.delete('page')
    setSearchParams(next)
  }

  const handlePageChange = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = resultado ? Math.ceil(resultado.total / LIMIT) : 0
  const hasActiveFilters = Boolean(q || categoriaParam)

  const categoriaName = categorias.find((c) => c.id === categoriaParam)?.nombre

  const sidebar = (
    <aside className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Categorías</h2>
        <ul className="space-y-2">
          {categorias.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="h-4 rounded bg-muted animate-pulse" />
            ))
          ) : (
            categorias.map((cat) => (
              <li key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={categoriaTemp === cat.id}
                  onCheckedChange={(checked) =>
                    setCategoriaTemp(checked ? cat.id : '')
                  }
                />
                <Label
                  htmlFor={`cat-${cat.id}`}
                  className="text-sm cursor-pointer font-normal leading-none"
                >
                  {cat.nombre}
                </Label>
              </li>
            ))
          )}
        </ul>
      </div>

      <Separator />

      <Button onClick={applyFilters} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        Aplicar Filtros
      </Button>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-muted-foreground hover:text-foreground gap-1"
        >
          <X className="size-3.5" />
          Limpiar filtros
        </Button>
      )}
    </aside>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Breadcrumb / header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          {q && (
            <p className="text-sm text-muted-foreground">
              Resultados para{' '}
              <span className="font-medium text-foreground">"{q}"</span>
              {resultado && (
                <span className="ml-1 text-muted-foreground">
                  — {resultado.total} {resultado.total === 1 ? 'producto' : 'productos'}
                </span>
              )}
            </p>
          )}
          {!q && categoriaName && (
            <p className="text-sm text-muted-foreground">
              Categoría: <span className="font-medium text-foreground">{categoriaName}</span>
              {resultado && (
                <span className="ml-1">— {resultado.total} productos</span>
              )}
            </p>
          )}
          {!q && !categoriaName && resultado && (
            <p className="text-sm text-muted-foreground">
              {resultado.total} productos en catálogo
            </p>
          )}
        </div>

        {/* Botón filtros mobile */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden gap-1.5"
          onClick={() => setSidebarOpen(true)}
        >
          <Filter className="size-4" />
          Filtros
          {hasActiveFilters && (
            <span className="flex size-4 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground font-bold">
              !
            </span>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-30 rounded-lg border border-border bg-card p-4">
            {sidebar}
          </div>
        </div>

        {/* Sidebar mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-card p-5 shadow-xl overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Filtros</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="min-w-0 flex-1">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-muted-foreground">Error al cargar productos.</p>
              <Button variant="outline" onClick={fetchProductos}>Reintentar</Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : resultado && resultado.productos.length === 0 ? (
            <EmptyState query={q} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {resultado?.productos.map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
