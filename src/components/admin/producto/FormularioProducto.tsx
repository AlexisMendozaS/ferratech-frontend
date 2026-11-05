/**
 * Alta y edición profesional de productos (INI-003). Modelo aprobado:
 * docs/avances/catalogo/modelo_de_producto.md · Regla DEC-012 en la pestaña «Interno».
 */
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, FileText, Images, Layers, ListTree, Loader2, Lock, Search, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminProductosService, motivosDeError } from '@/services/adminProductos'
import type { Categoria } from '@/types/categoria'
import type { EstadoProducto, ProductoAdmin } from '@/types/producto'
import { aEntrada, aFormulario, faltantesParaPublicar, type FormProducto } from './modelo'
import { PanelLateral } from './PanelLateral'
import { PestanaBusqueda } from './PestanaBusqueda'
import { PestanaEspecificaciones } from './PestanaEspecificaciones'
import { PestanaGeneral } from './PestanaGeneral'
import { PestanaImagenes } from './PestanaImagenes'
import { PestanaInterno } from './PestanaInterno'
import { PestanaVariantes } from './PestanaVariantes'

const ETIQUETA_ESTADO: Record<EstadoProducto, { texto: string; clase: string }> = {
  borrador: { texto: 'Borrador', clase: 'bg-muted text-muted-foreground' },
  publicado: { texto: 'Publicado', clase: 'bg-emerald-100 text-emerald-800' },
  archivado: { texto: 'Archivado', clase: 'bg-zinc-200 text-zinc-700' },
}

interface Props {
  producto?: ProductoAdmin
  categorias: Categoria[]
}

export function FormularioProducto({ producto: inicial, categorias }: Props) {
  const navigate = useNavigate()
  const [producto, setProducto] = useState(inicial)
  const [guardando, setGuardando] = useState<EstadoProducto | null>(null)
  // Errores del último intento, con una foto de los valores de ese momento.
  const [fallo, setFallo] = useState<{ motivos: string[]; foto: string } | null>(null)
  const metodos = useForm<FormProducto>({ defaultValues: aFormulario(inicial) })
  const { handleSubmit, reset, control, formState } = metodos
  const [galeria, variantes, nombre] = useWatch({ control, name: ['galeria', 'variantes', 'nombre'] })
  const todos = useWatch({ control })
  // En cuanto se edita algo, el aviso del intento anterior deja de ser vigente.
  const errores = fallo && fallo.foto === JSON.stringify(todos) ? fallo.motivos : []

  const estado = producto?.estado ?? 'borrador'

  const guardar = (nuevoEstado: EstadoProducto) =>
    handleSubmit(async (valores) => {
      setFallo(null)
      if (nuevoEstado === 'publicado') {
        const faltan = faltantesParaPublicar(valores)
        if (faltan.length) {
          setFallo({ motivos: faltan.map((f) => `Falta: ${f}`), foto: JSON.stringify(valores) })
          return
        }
      }
      setGuardando(nuevoEstado)
      try {
        const entrada = aEntrada(valores, nuevoEstado)
        const guardado = producto
          ? await adminProductosService.reemplazar(producto.id, entrada)
          : await adminProductosService.crear(entrada)
        setProducto(guardado)
        reset(aFormulario(guardado))
        toast.success(nuevoEstado === 'publicado' ? 'Producto publicado' : 'Cambios guardados', { description: guardado.nombre })
        if (!producto) navigate(`/admin/productos/${guardado.id}/editar`, { replace: true })
      } catch (e) {
        setFallo({ motivos: motivosDeError(e), foto: JSON.stringify(valores) })
      } finally {
        setGuardando(null)
      }
    })()

  const botonGuardar = (destino: EstadoProducto, texto: string, variante: 'default' | 'outline' = 'default') => (
    <Button type="button" variant={variante} disabled={guardando !== null} onClick={() => guardar(destino)}>
      {guardando === destino && <Loader2 className="animate-spin" />}
      {texto}
    </Button>
  )

  return (
    <FormProvider {...metodos}>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Link to="/admin/productos" className="text-sm text-muted-foreground hover:text-foreground">← Productos</Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">{nombre || (producto ? producto.nombre : 'Nuevo producto')}</h1>
              <Badge className={ETIQUETA_ESTADO[estado].clase}>{ETIQUETA_ESTADO[estado].texto}</Badge>
              {formState.isDirty && <span className="text-xs text-amber-700">Cambios sin guardar</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {estado === 'publicado' && producto && (
              <Button asChild variant="ghost">
                <a href={`/producto/${producto.slug}`} target="_blank" rel="noreferrer"><ExternalLink /> Ver en el sitio</a>
              </Button>
            )}
            {estado === 'publicado' ? (
              <>
                {botonGuardar('borrador', 'Pasar a borrador', 'outline')}
                {botonGuardar('publicado', 'Guardar cambios')}
              </>
            ) : (
              <>
                {botonGuardar('borrador', 'Guardar borrador', 'outline')}
                {botonGuardar('publicado', 'Publicar')}
              </>
            )}
          </div>
        </header>

        {errores.length > 0 && (
          <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">No se pudo guardar</p>
              <ul className="mt-1 list-disc pl-4">{errores.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general"><FileText /> General</TabsTrigger>
              <TabsTrigger value="imagenes"><Images /> Imágenes <span className="text-xs tabular-nums opacity-70">{galeria.length}</span></TabsTrigger>
              <TabsTrigger value="especificaciones"><ListTree /> Especificaciones</TabsTrigger>
              <TabsTrigger value="variantes"><Layers /> Variantes <span className="text-xs tabular-nums opacity-70">{variantes.length}</span></TabsTrigger>
              <TabsTrigger value="busqueda"><Search /> Búsqueda y SEO</TabsTrigger>
              <TabsTrigger value="interno"><Lock /> Interno</TabsTrigger>
            </TabsList>
            <TabsContent value="general"><PestanaGeneral categorias={categorias} slugActual={producto?.slug} /></TabsContent>
            <TabsContent value="imagenes"><PestanaImagenes /></TabsContent>
            <TabsContent value="especificaciones"><PestanaEspecificaciones /></TabsContent>
            <TabsContent value="variantes"><PestanaVariantes /></TabsContent>
            <TabsContent value="busqueda"><PestanaBusqueda /></TabsContent>
            <TabsContent value="interno"><PestanaInterno /></TabsContent>
          </Tabs>
          <PanelLateral />
        </div>
      </form>
    </FormProvider>
  )
}
