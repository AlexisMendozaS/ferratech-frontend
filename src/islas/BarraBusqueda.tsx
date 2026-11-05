/**
 * Buscador con autocompletado (INI-006). Sin JavaScript sigue funcionando: es un formulario GET
 * a `/?q=`. Con JavaScript sugiere productos y categorías mientras se escribe.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { Search } from 'lucide-react'

import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Sugerencias } from '@/types/producto'

interface Props {
  inicial?: string
  /** Versión grande de la portada. */
  grande?: boolean
  placeholder?: string
}

type Opcion = { tipo: 'producto' | 'categoria'; slug: string; nombre: string; href: string }

function opciones(s: Sugerencias | null): Opcion[] {
  if (!s) return []
  return [
    ...s.productos.map((p) => ({ tipo: 'producto' as const, ...p, href: `/producto/${p.slug}` })),
    ...s.categorias.map((c) => ({ tipo: 'categoria' as const, ...c, href: `/categoria/${c.slug}` })),
  ]
}

export default function BarraBusqueda({ inicial = '', grande = false, placeholder = 'Busca varilla, alambre, malla, block…' }: Props) {
  const [texto, setTexto] = useState(inicial)
  const [sugerencias, setSugerencias] = useState<Sugerencias | null>(null)
  const [abierta, setAbierta] = useState(false)
  const [activa, setActiva] = useState(-1)
  // Solo se sugiere cuando el cliente escribe, no con el texto con que llega la página.
  const [escribio, setEscribio] = useState(false)
  const ultima = useRef('')
  const id = useId()
  const lista = opciones(sugerencias)

  useEffect(() => {
    const q = texto.trim()
    if (!escribio || q.length < 2) return
    ultima.current = q
    const temporizador = setTimeout(() => {
      api
        .sugerir(q)
        .then((r) => {
          if (ultima.current === q) {
            setSugerencias(r)
            setActiva(-1)
          }
        })
        .catch(() => setSugerencias(null))
    }, 180)
    return () => clearTimeout(temporizador)
  }, [texto, escribio])

  const mostrar = abierta && texto.trim().length >= 2 && lista.length > 0

  function alTeclear(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrar) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiva((i) => (i + 1) % lista.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiva((i) => (i <= 0 ? lista.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activa >= 0) {
      e.preventDefault()
      window.location.href = lista[activa].href
    } else if (e.key === 'Escape') {
      setAbierta(false)
    }
  }

  return (
    <form action="/" method="get" role="search" className="relative w-full" onSubmit={() => setAbierta(false)}>
      <label htmlFor={`${id}-q`} className="sr-only">
        Buscar productos
      </label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg bg-white text-foreground shadow-sm ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-secondary',
          grande ? 'h-14 px-4 sm:h-16 sm:px-5' : 'h-10 px-3',
        )}
      >
        <Search className={cn('shrink-0 text-muted-foreground', grande ? 'size-5' : 'size-4')} aria-hidden />
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setEscribio(true)
            setAbierta(true)
          }}
          onFocus={() => setAbierta(true)}
          onBlur={() => setTimeout(() => setAbierta(false), 150)}
          onKeyDown={alTeclear}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={activa >= 0 ? `${id}-op-${activa}` : undefined}
          className={cn('min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground', grande ? 'text-base sm:text-lg' : 'text-sm')}
        />
        <button
          type="submit"
          className={cn(
            'shrink-0 rounded-md bg-secondary font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90',
            grande ? 'px-4 py-2 text-sm sm:px-6 sm:text-base' : 'px-3 py-1 text-xs',
          )}
        >
          Buscar
        </button>
      </div>

      {mostrar && (
        <ul
          id={`${id}-lista`}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {lista.map((op, i) => (
            <li key={`${op.tipo}-${op.slug}`} id={`${id}-op-${i}`} role="option" aria-selected={i === activa}>
              <a
                href={op.href}
                className={cn('flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-muted', i === activa && 'bg-muted')}
              >
                <span className="truncate">{op.nombre}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{op.tipo === 'producto' ? 'Producto' : 'Categoría'}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
