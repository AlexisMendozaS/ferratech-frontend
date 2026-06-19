import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Minus, Plus, ShoppingCart, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard, ProductCardSkeleton } from '@/components/productos/ProductCard'
import { productosService } from '@/services/productos'
import { categoriasService } from '@/services/categorias'
import type { Producto } from '@/types/producto'
import type { Categoria } from '@/types/categoria'

/* ── Galería ───────────────────────────────────────────────── */
function Gallery({ imagen, nombre }: { imagen: string | null; nombre: string }) {
  const thumbnails = [imagen, null, null, null, null].slice(0, 5)

  return (
    <div className="flex gap-3">
      {/* Miniaturas */}
      <div className="flex flex-col gap-2">
        {thumbnails.map((src, i) => (
          <button
            key={i}
            className={`size-14 shrink-0 rounded-md border-2 overflow-hidden bg-muted transition-colors ${
              i === 0 ? 'border-primary' : 'border-border hover:border-muted-foreground'
            }`}
          >
            {src ? (
              <img src={src} alt={`${nombre} ${i + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
          </button>
        ))}
      </div>

      {/* Imagen principal */}
      <div className="flex-1 aspect-square rounded-lg border border-border bg-muted overflow-hidden">
        {imagen ? (
          <img src={imagen} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/25">
            <svg className="size-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Skeleton de la página ────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="size-14 rounded-md" />)}
          </div>
          <Skeleton className="flex-1 aspect-square rounded-lg" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-9 w-1/3" />
          <Separator />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-16 rounded-full" />)}
          </div>
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
          </div>
          <Separator />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ─────────────────────────────────────── */
export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()

  const [producto, setProducto] = useState<Producto | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [relacionados, setRelacionados] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadingRel, setLoadingRel] = useState(false)

  // Record<atributo.nombre, opción seleccionada>
  const [seleccion, setSeleccion] = useState<Record<string, string>>({})
  const [cantidad, setCantidad] = useState(1)
  const [adding, setAdding] = useState(false)

  const prevIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!id || id === prevIdRef.current) return
    prevIdRef.current = id

    setLoading(true)
    setError(false)
    setSeleccion({})
    setCantidad(1)
    setRelacionados([])

    Promise.all([
      productosService.obtener(id),
      categoriasService.listar(),
    ])
      .then(([prod, cats]) => {
        setProducto(prod)
        setCategorias(cats)

        if (prod.categorias.length > 0) {
          setLoadingRel(true)
          productosService
            .buscar({ categoria: prod.categorias[0], limit: 7 })
            .then((res) => {
              setRelacionados(res.productos.filter((p) => p.id !== id).slice(0, 6))
            })
            .catch(() => {})
            .finally(() => setLoadingRel(false))
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const toggleOpcion = (nombre: string, opcion: string) => {
    setSeleccion((prev) => ({
      ...prev,
      [nombre]: prev[nombre] === opcion ? '' : opcion,
    }))
  }

  const todasSeleccionadas =
    producto !== null &&
    producto.atributos.length > 0 &&
    producto.atributos.every((a) => seleccion[a.nombre])

  const puedeAñadir =
    producto !== null &&
    (producto.atributos.length === 0 || todasSeleccionadas)

  const handleAddToCart = async () => {
    if (!producto || !puedeAñadir) return
    setAdding(true)
    await new Promise((r) => setTimeout(r, 300)) // simula latencia
    setAdding(false)

    const variante = Object.entries(seleccion)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ')

    toast.success('Añadido al carrito', {
      description: variante || producto.nombre,
    })
  }

  const categoriaNombres = producto
    ? producto.categorias
        .map((cid) => categorias.find((c) => c.id === cid)?.nombre)
        .filter(Boolean)
    : []

  if (loading) return <PageSkeleton />

  if (error || !producto) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <p className="text-lg text-muted-foreground">Producto no encontrado.</p>
        <Button asChild variant="outline">
          <Link to="/productos">Ver catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Ruta">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="size-3.5" />
        <Link to="/productos" className="hover:text-foreground transition-colors">Productos</Link>
        {categoriaNombres[0] && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              to={`/productos?categoria=${producto.categorias[0]}`}
              className="hover:text-foreground transition-colors"
            >
              {categoriaNombres[0]}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground line-clamp-1 max-w-50">{producto.nombre}</span>
      </nav>

      {/* Layout principal */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Galería */}
        <Gallery imagen={producto.imagen_principal} nombre={producto.nombre} />

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Nombre y badges */}
          <div className="flex flex-wrap items-start gap-2">
            {producto.bajo_pedido && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground shrink-0">
                Bajo pedido
              </Badge>
            )}
            {categoriaNombres.map((n) => (
              <Badge key={n} variant="outline" className="shrink-0">{n}</Badge>
            ))}
          </div>

          <h1 className="text-2xl font-bold leading-tight text-foreground">
            {producto.nombre}
          </h1>

          {producto.precio != null ? (
            <p className="text-3xl font-bold text-foreground">
              ${producto.precio.toLocaleString('es-MX')}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">Precio a consultar</p>
          )}

          <Separator />

          {/* Selectores de atributos */}
          {producto.atributos.length > 0 && (
            <div className="flex flex-col gap-4">
              {producto.atributos.map((attr) => (
                <div key={attr.nombre} className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {attr.nombre}
                    {seleccion[attr.nombre] && (
                      <span className="ml-2 font-normal text-muted-foreground">
                        — {seleccion[attr.nombre]}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attr.opciones.map((op) => {
                      const activo = seleccion[attr.nombre] === op
                      return (
                        <button
                          key={op}
                          onClick={() => toggleOpcion(attr.nombre, op)}
                          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                            activo
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/50'
                          }`}
                        >
                          {op}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aviso si falta selección */}
          {producto.atributos.length > 0 && !todasSeleccionadas && (
            <p className="text-xs text-muted-foreground">
              Selecciona todas las opciones para añadir al carrito.
            </p>
          )}

          {/* Cantidad */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Cantidad</p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                disabled={cantidad <= 1}
                aria-label="Reducir cantidad"
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">
                {cantidad}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => setCantidad((c) => c + 1)}
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Acciones */}
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              disabled={!puedeAñadir || adding}
              onClick={handleAddToCart}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <ShoppingCart className="size-4" />
              {adding ? 'Añadiendo…' : 'Añadir al Carrito'}
            </Button>
            <Button
              size="lg"
              disabled={!puedeAñadir}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Zap className="size-4" />
              Comprar Ahora
            </Button>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {producto.descripcion && (
        <section className="mt-14">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Descripción</h2>
          <Separator className="mb-4" />
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {producto.descripcion}
          </p>
        </section>
      )}

      {/* Especificaciones (atributos como tabla) */}
      {producto.atributos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Especificaciones</h2>
          <Separator className="mb-4" />
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {producto.atributos.map((attr) => (
              <div key={attr.nombre} className="flex gap-2 text-sm">
                <dt className="w-32 shrink-0 font-medium text-foreground">{attr.nombre}</dt>
                <dd className="text-muted-foreground">{attr.opciones.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Productos relacionados */}
      {(loadingRel || relacionados.length > 0) && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Productos relacionados con este artículo
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {loadingRel
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : relacionados.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
