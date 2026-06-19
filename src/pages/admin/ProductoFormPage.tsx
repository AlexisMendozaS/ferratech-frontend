import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ProductoForm } from '@/components/admin/ProductoForm'
import { productosService } from '@/services/productos'
import type { Producto } from '@/types/producto'

export default function ProductoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const [producto, setProducto] = useState<Producto | undefined>(undefined)
  const [loading, setLoading] = useState(isEditing)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    productosService
      .obtener(id)
      .then(setProducto)
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isEditing
            ? 'Modifica los campos que necesites y guarda los cambios.'
            : 'Completa el formulario para dar de alta un nuevo producto.'}
        </p>
      </header>

      <ProductoForm
        producto={producto}
        onSuccess={() => navigate('/admin/productos')}
        onCancel={() => navigate('/admin/productos')}
      />
    </div>
  )
}
