import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { categoriasService } from '@/services/categorias'
import type { Categoria } from '@/types/categoria'

function CategoriaCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border bg-card overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

function CategoriaCard({ categoria }: { categoria: Categoria }) {
  return (
    <article className="flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagen / placeholder */}
      <div className="flex h-44 items-center justify-center overflow-hidden bg-muted">
        {categoria.imagen ? (
          <img
            src={categoria.imagen}
            alt={categoria.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 80 80"
            fill="none"
            className="size-20 text-foreground/20"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <polygon points="40,8 68,64 12,64" />
            <circle cx="20" cy="66" r="10" />
            <rect x="48" y="54" width="20" height="20" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 p-4">
        <h2 className="text-sm font-semibold text-foreground">{categoria.nombre}</h2>
        {categoria.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-2">{categoria.descripcion}</p>
        )}
        <Button
          asChild
          size="sm"
          className="mt-auto bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Link to={`/categorias/${categoria.id}`}>Mostrar Productos</Link>
        </Button>
      </div>
    </article>
  )
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    categoriasService.listar()
      .then(setCategorias)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-4xl font-black text-foreground">Categorías</h1>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No se pudieron cargar las categorías.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array(8).fill(null).map((_, i) => <CategoriaCardSkeleton key={i} />)
              : categorias.map((cat) => <CategoriaCard key={cat.id} categoria={cat} />)}
          </div>
        )}
      </div>
    </div>
  )
}
