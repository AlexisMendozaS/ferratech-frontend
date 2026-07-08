import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard, ProductCardSkeleton } from '@/components/productos/ProductCard'
import { productosService } from '@/services/productos'
import { categoriasService } from '@/services/categorias'
import type { Producto } from '@/types/producto'
import type { Categoria } from '@/types/categoria'

// ─────────────────────────────────────────────────────────────────────────────
// Hero Carousel
// ─────────────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 1,
    tag: 'Oferta Especial',
    title: 'Herramientas\nEléctricas',
    subtitle: 'Hasta 40% de descuento en las mejores marcas del mercado',
    cta: 'Ver Ofertas',
    href: '/productos?oferta=true',
    bg: 'from-red-700 via-red-800 to-red-950',
  },
  {
    id: 2,
    tag: 'Nuevos Arrivals',
    title: 'Materiales de\nConstrucción',
    subtitle: 'Todo lo que necesitas para tu obra al mejor precio garantizado',
    cta: 'Ver Productos',
    href: '/productos',
    bg: 'from-slate-700 via-slate-800 to-slate-950',
  },
  {
    id: 3,
    tag: 'Temporada',
    title: 'Herramientas\nManuales',
    subtitle: 'Calidad profesional para cada proyecto en tu hogar',
    cta: 'Explorar',
    href: '/productos',
    bg: 'from-orange-700 via-orange-800 to-orange-950',
  },
]

function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(next, 5000)
  }, [next])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    startTimer()
    return stopTimer
  }, [startTimer, stopTimer])

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
    >
      {/* Track */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className={`relative flex-none w-full h-[300px] sm:h-[400px] bg-gradient-to-br ${slide.bg} overflow-hidden`}
          >
            {/* Decorative shapes */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 size-80 rounded-full bg-white/5" />
              <div className="absolute top-10 right-32 size-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-10 -left-10 size-64 rounded-full bg-black/10" />
              <div className="absolute right-1/4 top-0 bottom-0 w-px bg-white/5" />
              <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/5" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-white/60 border border-white/20 rounded-full px-3 py-1 w-fit">
                {slide.tag}
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight whitespace-pre-line">
                {slide.title}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/60 max-w-sm leading-relaxed">
                {slide.subtitle}
              </p>
              <Link
                to={slide.href}
                className="mt-6 inline-flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm rounded-full px-6 py-2.5 hover:bg-white/90 active:scale-95 transition-all w-fit"
              >
                {slide.cta}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm flex items-center justify-center transition"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm flex items-center justify-center transition"
        aria-label="Slide siguiente"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Featured Categories — 4 cards overlapping the carousel bottom
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedCategoriasSection({
  categorias,
  loading,
}: {
  categorias: Categoria[]
  loading: boolean
}) {
  const items = loading ? Array(4).fill(null) : categorias.slice(0, 4)

  return (
    <section className="relative z-10 -mt-8 mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((cat: Categoria | null, i) =>
          !cat ? (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-xl border bg-card shadow-lg p-5"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ) : (
            <div
              key={cat.id}
              className="flex flex-col items-center gap-3 rounded-xl border bg-card shadow-lg p-5 text-center"
            >
              <p className="text-sm font-semibold text-foreground line-clamp-1">{cat.nombre}</p>

              <div className="size-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground/30 shrink-0">
                {cat.imagen ? (
                  <img src={cat.imagen} alt={cat.nombre} className="size-full object-cover" />
                ) : (
                  <svg viewBox="0 0 48 48" fill="none" className="size-9" stroke="currentColor" strokeWidth={1.5}>
                    <polygon points="24,6 42,40 6,40" />
                    <circle cx="13" cy="40" r="6" />
                    <rect x="28" y="32" width="12" height="12" />
                  </svg>
                )}
              </div>

              <Button
                asChild
                size="sm"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-8"
              >
                <Link to={`/productos?categoria=${cat.id}`}>Mostrar Productos</Link>
              </Button>
            </div>
          )
        )}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Ofertas Especiales
// ─────────────────────────────────────────────────────────────────────────────

function OfertasSection({
  productos,
  loading,
}: {
  productos: Producto[]
  loading: boolean
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Ofertas Especiales</h2>
        <Link
          to="/productos?oferta=true"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todas <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading
          ? Array(4).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)
          : productos.slice(0, 4).map((p) => <ProductCard key={p.id} producto={p} />)}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Categorías grid completo
// ─────────────────────────────────────────────────────────────────────────────

function CategoriasSection({
  categorias,
  loading,
}: {
  categorias: Categoria[]
  loading: boolean
}) {
  return (
    <section className="bg-muted/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Categorías</h2>
          <Link
            to="/categorias"
            className="text-sm font-medium text-primary hover:underline"
          >
            Mostrar todas las categorías
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array(8).fill(null).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3"
                >
                  <Skeleton className="size-14 rounded-lg shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))
            : categorias.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?categoria=${cat.id}`}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-3 hover:shadow-md transition-shadow"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {cat.imagen ? (
                      <img
                        src={cat.imagen}
                        alt={cat.nombre}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground/30">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                        >
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {cat.nombre}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingProds, setLoadingProds] = useState(true)

  useEffect(() => {
    categoriasService.listar()
      .then(setCategorias)
      .catch(console.error)
      .finally(() => setLoadingCats(false))

    productosService.listar(8)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoadingProds(false))
  }, [])

  return (
    <div>
      <HeroCarousel />
      <FeaturedCategoriasSection categorias={categorias} loading={loadingCats} />
      <OfertasSection productos={productos} loading={loadingProds} />
      <CategoriasSection categorias={categorias} loading={loadingCats} />
    </div>
  )
}
