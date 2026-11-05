/**
 * Detalle público de un producto (familia con variantes). Modelo:
 * docs/avances/catalogo/modelo_de_producto.md. Sin precio, marca ni proveedor (DEC-012).
 *
 * Nota: el sitio público se rehace como páginas estáticas con Astro (INI-007, DEC-006);
 * esta página mantiene el sitio actual funcionando con el modelo nuevo mientras tanto.
 */
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Info, MessageSquareQuote, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard, ProductCardSkeleton } from '@/components/productos/ProductCard'
import { Seo } from '@/components/seo/Seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { useAsyncData } from '@/hooks/useAsyncData'
import { categoriasService } from '@/services/categorias'
import { productosService } from '@/services/productos'
import { useCarritoStore } from '@/store/carritoStore'
import { describeVariante, type Imagen, type ProductoPublico, type VariantePublica } from '@/types/producto'

const SITE = 'https://ferratech.com.mx'

/* ── Galería ───────────────────────────────────────────────── */
function Galeria({ imagenes, nombre }: { imagenes: Imagen[]; nombre: string }) {
  const [actual, setActual] = useState(0)
  const ordenadas = [...imagenes].sort((a, b) => a.orden - b.orden)
  const principal = ordenadas[actual] ?? ordenadas[0]

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      <div className="flex-1 aspect-square rounded-lg border border-border bg-muted overflow-hidden">
        {principal ? (
          <img src={principal.url} alt={principal.alt || nombre} className="h-full w-full object-contain" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/25">
            <svg className="size-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      {ordenadas.length > 1 && (
        <div className="flex flex-row gap-2 sm:flex-col">
          {ordenadas.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActual(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === actual}
              className={`size-14 shrink-0 rounded-md border-2 overflow-hidden bg-muted transition-colors ${
                i === actual ? 'border-primary' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Tabla de variantes (como «Calibres de alambres» del catálogo) ── */
function TablaVariantes({ producto }: { producto: ProductoPublico }) {
  const columnas: string[] = []
  for (const v of producto.variantes) {
    for (const f of v.especificaciones) {
      const col = f.unidad ? `${f.clave} (${f.unidad})` : f.clave
      if (!columnas.includes(col)) columnas.push(col)
    }
  }
  if (columnas.length === 0 || producto.variantes.length < 2) return null
  const valor = (v: VariantePublica, col: string) =>
    v.especificaciones.find((f) => (f.unidad ? `${f.clave} (${f.unidad})` : f.clave) === col)?.valor ?? '—'

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-semibold text-foreground">Medidas por variante</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              {producto.ejes.map((e) => <th key={e.nombre} className="px-3 py-2 font-medium">{e.nombre}</th>)}
              {columnas.map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}
              <th className="px-3 py-2 font-medium">Unidad</th>
            </tr>
          </thead>
          <tbody>
            {producto.variantes.map((v) => (
              <tr key={v.sku} className="border-t border-border">
                {producto.ejes.map((e) => <td key={e.nombre} className="px-3 py-2">{v.valores[e.nombre]}</td>)}
                {columnas.map((c) => <td key={c} className="px-3 py-2 tabular-nums text-muted-foreground">{valor(v, c)}</td>)}
                <td className="px-3 py-2 text-muted-foreground">{v.unidad_venta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Separator />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-16 rounded-full" />)}</div>
          <Separator />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

/* ── Página ───────────────────────────────────────────────── */
export default function ProductoDetallePage() {
  const { id: slug = '' } = useParams<{ id: string }>()
  const { data: producto, loading, error } = useAsyncData(() => productosService.obtener(slug), `producto:${slug}`, !!slug)

  if (loading && !producto) return <PageSkeleton />
  if (error || !producto) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <p className="text-lg text-muted-foreground">No encontramos ese producto.</p>
        <p className="max-w-md text-sm text-muted-foreground">Dinos qué buscas y te lo conseguimos al mejor precio.</p>
        <Button asChild variant="outline"><Link to="/productos">Ver catálogo</Link></Button>
      </div>
    )
  }
  // Slug anterior o id: la URL canónica es la del slug actual.
  if (producto.slug !== slug) return <Navigate to={`/producto/${producto.slug}`} replace />

  return <Detalle key={producto.id} producto={producto} />
}

function Detalle({ producto }: { producto: ProductoPublico }) {
  const addItem = useCarritoStore((s) => s.addItem)
  const unica = producto.ejes.length === 0 && producto.variantes.length === 1
  const [seleccion, setSeleccion] = useState<Record<string, string>>(() => (unica ? { ...producto.variantes[0].valores } : {}))
  const [cantidad, setCantidad] = useState(1)

  const { data: categoria } = useAsyncData(
    () => categoriasService.obtener(producto.categoria_principal!),
    `categoria:${producto.categoria_principal}`,
    !!producto.categoria_principal,
  )
  const { data: similares, loading: cargandoSimilares } = useAsyncData(
    () => productosService.buscar({ categoria: producto.categoria_principal!, limit: 7 }),
    `similares:${producto.id}`,
    !!producto.categoria_principal,
  )
  const relacionados = (similares?.productos ?? []).filter((p) => p.id !== producto.id).slice(0, 6)

  const completa = producto.ejes.every((e) => seleccion[e.nombre])
  const variante = completa
    ? producto.variantes.find((v) => producto.ejes.every((e) => v.valores[e.nombre] === seleccion[e.nombre]))
    : undefined
  const combinacionSinVariante = completa && !variante && producto.ejes.length > 0
  const descontinuado = (variante?.disponibilidad ?? producto.disponibilidad) === 'descontinuado'
  const bajoPedido = (variante?.disponibilidad ?? producto.disponibilidad) === 'bajo_pedido'

  const agregar = () => {
    const texto = describeVariante(variante?.valores ?? seleccion)
    addItem({
      id_producto: producto.id,
      nombre: producto.nombre,
      imagen: variante?.imagen ?? producto.galeria[0]?.url ?? null,
      variante_seleccionada: texto || null,
      sku: variante?.sku ?? null,
      unidad_venta: variante?.unidad_venta ?? null,
      cantidad,
    })
    toast.success('Agregado a tu cotización', { description: texto || producto.nombre })
  }

  const puedeAgregar = completa || producto.ejes.length === 0
  const descripcion = producto.meta_descripcion ?? producto.descripcion_corta ?? `${producto.nombre}. Cotiza sin costo en FerraTech.`

  const botonAgregar = (className: string) => (
    <Button size="lg" disabled={!puedeAgregar} onClick={agregar} className={`gap-2 bg-accent hover:bg-accent/90 text-accent-foreground ${className}`}>
      <ShoppingCart className="size-4" />
      {combinacionSinVariante ? 'Cotizar esta combinación' : 'Agregar a mi cotización'}
    </Button>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8">
      <Seo title={producto.meta_titulo ?? producto.nombre} description={descripcion} image={producto.galeria[0]?.url} canonical={`${SITE}/producto/${producto.slug}`} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: producto.nombre,
          description: producto.descripcion_corta ?? producto.descripcion ?? undefined,
          image: producto.galeria.map((g) => g.url),
          ...(producto.variantes.length === 1 && { sku: producto.variantes[0].sku }),
          ...(categoria && { category: categoria.nombre }),
          // DEC-012: sin `brand` ni `offers` (no se publican marca ni precio).
        }}
      />

      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Ruta">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="size-3.5" />
        <Link to="/productos" className="hover:text-foreground transition-colors">Productos</Link>
        {categoria && (
          <>
            <ChevronRight className="size-3.5" />
            <Link to={`/categorias/${categoria.slug}`} className="hover:text-foreground transition-colors">{categoria.nombre}</Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground line-clamp-1 max-w-60">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Galeria imagenes={producto.galeria} nombre={producto.nombre} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {bajoPedido && <Badge variant="secondary">Bajo pedido</Badge>}
            {descontinuado && <Badge variant="destructive">Descontinuado</Badge>}
          </div>
          <h1 className="text-2xl font-bold leading-tight text-foreground">{producto.nombre}</h1>
          {producto.descripcion_corta && <p className="text-muted-foreground">{producto.descripcion_corta}</p>}

          <div className="flex items-start gap-2 rounded-md bg-primary/5 p-3 text-sm text-foreground">
            <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-primary" />
            <p><span className="font-semibold">Cotiza sin costo.</span> Te conseguimos este material al mejor precio y te contactamos.</p>
          </div>

          {descontinuado && (
            <p className="flex gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" /> Este producto se descontinuó: pide tu cotización y te ofrecemos la mejor alternativa.
            </p>
          )}

          <Separator />

          {producto.ejes.map((eje) => (
            <div key={eje.nombre} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                {eje.nombre}
                {seleccion[eje.nombre] && <span className="ml-2 font-normal text-muted-foreground">— {seleccion[eje.nombre]}</span>}
              </p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={eje.nombre}>
                {eje.opciones.map((op) => {
                  const activo = seleccion[eje.nombre] === op
                  return (
                    <button
                      key={op}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => setSeleccion((prev) => ({ ...prev, [eje.nombre]: activo ? '' : op }))}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        activo ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'
                      }`}
                    >
                      {op}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {producto.ejes.length > 0 && !completa && (
            <p className="text-xs text-muted-foreground">Elige {producto.ejes.map((e) => e.nombre.toLowerCase()).join(' y ')} para agregarlo a tu cotización.</p>
          )}
          {combinacionSinVariante && (
            <p className="text-xs text-muted-foreground">No tenemos registrada esa combinación, pero podemos conseguirla: agrégala y te cotizamos.</p>
          )}

          {variante && (
            <div className="rounded-md border border-border p-3 text-sm">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 className="size-4 text-primary" /> {describeVariante(variante.valores) || 'Presentación única'}
              </p>
              <p className="mt-1 text-muted-foreground">
                Se vende por <span className="font-medium text-foreground">{variante.unidad_venta}</span>
                {variante.venta_minima ? ` · mínimo ${variante.venta_minima} ${variante.unidad_venta}` : ''} · SKU {variante.sku}
              </p>
              {variante.especificaciones.length > 0 && (
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                  {variante.especificaciones.map((f, i) => (
                    <li key={i}><span className="text-foreground">{f.clave}:</span> {f.valor}{f.unidad ? ` ${f.unidad}` : ''}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Cantidad</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-9" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={cantidad <= 1} aria-label="Reducir cantidad">
                <Minus className="size-3.5" />
              </Button>
              <span className="w-10 text-center text-sm font-medium tabular-nums">{cantidad}</span>
              <Button variant="outline" size="icon" className="size-9" onClick={() => setCantidad((c) => c + 1)} aria-label="Aumentar cantidad">
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          <Separator />
          {botonAgregar('hidden sm:flex')}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur-sm sm:hidden">
        {botonAgregar('flex-1')}
      </div>

      {producto.descripcion && (
        <section className="mt-14">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Descripción</h2>
          <Separator className="mb-4" />
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{producto.descripcion}</p>
        </section>
      )}

      {(producto.ventajas.length > 0 || producto.aplicaciones.length > 0) && (
        <section className="mt-10 grid gap-8 sm:grid-cols-2">
          {producto.ventajas.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-foreground">Ventajas</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{producto.ventajas.map((v) => <li key={v}>{v}</li>)}</ul>
            </div>
          )}
          {producto.aplicaciones.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-foreground">Aplicaciones</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{producto.aplicaciones.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
          )}
        </section>
      )}

      {producto.especificaciones.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Especificaciones</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {producto.especificaciones.map((g) => (
              <div key={g.grupo} className="rounded-lg border border-border">
                <h3 className="border-b border-border bg-muted/60 px-3 py-2 text-sm font-semibold">{g.grupo}</h3>
                <dl className="divide-y divide-border text-sm">
                  {g.filas.map((f, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3 px-3 py-2">
                      <dt className="font-medium text-foreground">{f.clave}</dt>
                      <dd className="text-muted-foreground">{f.valor}{f.unidad ? ` ${f.unidad}` : ''}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      <TablaVariantes producto={producto} />

      {(cargandoSimilares || relacionados.length > 0) && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-semibold text-foreground">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {cargandoSimilares
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : relacionados.map((p) => <ProductCard key={p.id} producto={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
