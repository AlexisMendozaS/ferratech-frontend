/**
 * Resumen del panel (INI-009): qué atender hoy y qué está trayendo ventas.
 * Regla: un KPI entra solo si el vendedor puede actuar con él. Cada cifra se compara con el
 * periodo anterior de la misma duración.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, Minus, RefreshCw, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsyncData } from '@/hooks/useAsyncData'
import { cn } from '@/lib/utils'
import { adminKpisService, type Comparado, type Kpis, type Periodo } from '@/services/adminKpis'

const PERIODOS: Periodo[] = [7, 30, 90]
const numero = new Intl.NumberFormat('es-MX')
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

// ── Piezas ─────────────────────────────────────────────────────────────────────

function Variacion({ valor, dias }: { valor: Comparado; dias: number }) {
  const { actual, anterior } = valor
  if (anterior === 0 && actual === 0) return <p className="text-xs text-muted-foreground">Sin movimiento</p>
  const cambio = anterior === 0 ? null : Math.round(((actual - anterior) / anterior) * 100)
  const sube = actual > anterior
  const Icono = actual === anterior ? Minus : sube ? ArrowUpRight : ArrowDownRight
  return (
    <p className={cn('flex items-center gap-1 text-xs', actual === anterior ? 'text-muted-foreground' : sube ? 'text-green-700' : 'text-red-700')}>
      <Icono className="size-3.5" aria-hidden />
      <span>
        {cambio === null ? 'Nuevo' : `${cambio > 0 ? '+' : ''}${cambio} %`}{' '}
        <span className="text-muted-foreground">vs. {dias} días anteriores</span>
      </span>
    </p>
  )
}

function Indicador({
  titulo,
  valor,
  detalle,
  alerta = false,
  enlace,
}: {
  titulo: string
  valor: string
  detalle?: React.ReactNode
  alerta?: boolean
  enlace?: { a: string; texto: string }
}) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-xl border bg-card p-4', alerta && 'border-amber-300 bg-amber-50')}>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {alerta && <AlertTriangle className="size-4 text-amber-600" aria-label="Requiere atención" />}
        {titulo}
      </p>
      <p className="text-3xl font-bold tabular-nums">{valor}</p>
      {detalle}
      {enlace && (
        <Link to={enlace.a} className="mt-auto text-sm font-medium text-primary hover:underline">
          {enlace.texto} →
        </Link>
      )}
    </div>
  )
}

function Tarjeta({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold">{titulo}</h2>
      {ayuda && <p className="mt-0.5 text-xs text-muted-foreground">{ayuda}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Vacio({ texto }: { texto: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{texto}</p>
}

/** Ranking en barras horizontales: una sola serie, un solo color, el número siempre escrito. */
function Barras({
  filas,
  vacio,
}: {
  filas: { clave: string; etiqueta: React.ReactNode; valor: number; nota?: string }[]
  vacio: string
}) {
  if (filas.length === 0) return <Vacio texto={vacio} />
  const maximo = Math.max(...filas.map((f) => f.valor), 1)
  return (
    <ol className="space-y-2.5">
      {filas.map((f) => (
        <li key={f.clave} title={`${typeof f.etiqueta === 'string' ? f.etiqueta : ''}: ${numero.format(f.valor)}${f.nota ? ` · ${f.nota}` : ''}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{f.etiqueta}</span>
            <span className="shrink-0 tabular-nums font-medium">{numero.format(f.valor)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(f.valor / maximo) * 100}%` }} />
          </div>
          {f.nota && <p className="mt-0.5 text-xs text-muted-foreground">{f.nota}</p>}
        </li>
      ))}
    </ol>
  )
}

function Embudo({ etapas, dias }: { etapas: Kpis['embudo']; dias: number }) {
  // La escala es la etapa mayor: puede haber más búsquedas que visitas.
  const base = Math.max(...etapas.map((e) => e.actual), 1)
  if (etapas.every((e) => e.actual === 0)) return <Vacio texto="Todavía no hay visitas registradas en este periodo." />
  return (
    <ol className="space-y-3">
      {etapas.map((e, i) => {
        const previa = i > 0 ? etapas[i - 1].actual : null
        const paso = previa ? Math.round((e.actual / previa) * 100) : null
        return (
          <li key={e.etapa} title={`${e.etapa}: ${numero.format(e.actual)} (antes ${numero.format(e.anterior)})`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{e.etapa}</span>
              <span className="flex items-baseline gap-2">
                {paso !== null && <span className="text-xs text-muted-foreground">{paso} % de la etapa anterior</span>}
                <span className="font-semibold tabular-nums">{numero.format(e.actual)}</span>
              </span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((e.actual / base) * 100, e.actual ? 2 : 0)}%` }} />
            </div>
            <div className="mt-0.5">
              <Variacion valor={{ actual: e.actual, anterior: e.anterior }} dias={dias} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [dias, setDias] = useState<Periodo>(30)
  const [recarga, setRecarga] = useState(0)
  const { data: k, loading, error } = useAsyncData(() => adminKpisService.obtener(dias), `${dias}:${recarga}`)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Resumen</h1>
          <p className="text-sm text-muted-foreground">Qué atender hoy y qué está trayendo ventas.</p>
        </div>
        <div role="group" aria-label="Periodo" className="inline-flex rounded-lg border bg-card p-0.5">
          {PERIODOS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={dias === p}
              onClick={() => setDias(p)}
              className={cn('rounded-md px-3 py-1.5 text-sm', dias === p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              {p} días
            </button>
          ))}
        </div>
      </header>

      {error && !k ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-10 text-center">
          <p className="font-medium">No se pudieron cargar los indicadores.</p>
          <Button variant="outline" onClick={() => setRecarga((n) => n + 1)} className="gap-2">
            <RefreshCw className="size-4" /> Reintentar
          </Button>
        </div>
      ) : !k ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className={cn('space-y-6 transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
          <section aria-label="Qué atender hoy" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador
              titulo="Cotizaciones sin responder"
              valor={numero.format(k.cotizaciones.sin_responder)}
              alerta={k.cotizaciones.sin_responder > 0}
              detalle={<p className="text-xs text-muted-foreground">De cualquier fecha</p>}
              enlace={{ a: '/admin/cotizaciones', texto: 'Responder' }}
            />
            <Indicador
              titulo="Tiempo de primera respuesta"
              valor={k.cotizaciones.respuesta_mediana_horas === null ? '—' : `${k.cotizaciones.respuesta_mediana_horas} h`}
              detalle={
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden /> Mediana del periodo
                </p>
              }
            />
            <Indicador
              titulo="Cotizaciones recibidas"
              valor={numero.format(k.cotizaciones.nuevas.actual)}
              detalle={<Variacion valor={k.cotizaciones.nuevas} dias={k.dias} />}
            />
            <Indicador
              titulo="Ventas ganadas"
              valor={numero.format(k.cotizaciones.ganadas.actual)}
              detalle={
                <>
                  <Variacion valor={k.cotizaciones.ganadas} dias={k.dias} />
                  <p className="text-xs text-muted-foreground">
                    {k.cotizaciones.tasa_ganadas === null
                      ? 'Sin cotizaciones cerradas'
                      : `${Math.round(k.cotizaciones.tasa_ganadas * 100)} % de las cerradas · ${pesos.format(k.cotizaciones.monto_ganado.actual)}`}
                  </p>
                </>
              }
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Tarjeta titulo="Embudo de ventas" ayuda="De la visita a la cotización enviada.">
              <Embudo etapas={k.embudo} dias={k.dias} />
            </Tarjeta>
            <Tarjeta titulo="Demanda no cubierta" ayuda="Lo que se buscó y no había. Agregarlo al catálogo es venta directa.">
              <Barras
                filas={k.demanda_no_cubierta.map((t) => ({ clave: t.termino, etiqueta: t.termino, valor: t.veces }))}
                vacio="Todas las búsquedas encontraron productos."
              />
              {k.demanda_no_cubierta.length > 0 && (
                <Link to="/admin/productos/nuevo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <SearchX className="size-4" aria-hidden /> Agregar un producto
                </Link>
              )}
            </Tarjeta>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Tarjeta titulo="Búsquedas más frecuentes">
              <Barras
                filas={k.busquedas_frecuentes.map((t) => ({
                  clave: t.termino,
                  etiqueta: t.termino,
                  valor: t.veces,
                  nota: t.sin_resultado ? `${t.sin_resultado} sin resultado` : undefined,
                }))}
                vacio="Aún no hay búsquedas en este periodo."
              />
            </Tarjeta>
            <Tarjeta titulo="Productos más vistos">
              <Barras
                filas={k.productos_mas_vistos.map((p) => ({
                  clave: p.slug ?? p.nombre,
                  etiqueta: p.slug ? (
                    <a href={`/producto/${p.slug}`} target="_blank" rel="noreferrer" className="hover:underline">
                      {p.nombre}
                    </a>
                  ) : (
                    p.nombre
                  ),
                  valor: p.veces,
                }))}
                vacio="Aún no hay visitas a productos."
              />
            </Tarjeta>
            <Tarjeta titulo="Productos más cotizados" ayuda="En cuántas cotizaciones aparece cada uno.">
              <Barras
                filas={k.productos_mas_cotizados.map((p) => ({ clave: p.id ?? p.nombre, etiqueta: p.nombre, valor: p.veces }))}
                vacio="Aún no hay cotizaciones en este periodo."
              />
            </Tarjeta>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Tarjeta titulo="Cotizaciones por estado" ayuda="Estado de la obra que indica el cliente.">
              <Barras
                filas={k.cotizaciones_por_estado.map((e) => ({
                  clave: e.nombre,
                  etiqueta: e.nombre,
                  valor: e.total,
                  nota: e.convertidos ? `${e.convertidos} ganada(s)` : undefined,
                }))}
                vacio="Aún no hay cotizaciones en este periodo."
              />
            </Tarjeta>
            <Tarjeta titulo="Contactos por origen" ayuda="Cuántos pidieron después una cotización (mismo teléfono).">
              <Barras
                filas={k.contactos_por_origen.map((c) => ({
                  clave: c.nombre,
                  etiqueta: c.nombre,
                  valor: c.total,
                  nota: `${c.convertidos} se volvieron cotización`,
                }))}
                vacio="Aún no hay contactos en este periodo."
              />
            </Tarjeta>
          </div>
        </div>
      )}
    </div>
  )
}
