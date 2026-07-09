import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle,
  FileUp,
  Loader2,
  Package,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { categoriasService } from '@/services/categorias'
import {
  extraerProductosDePdf,
  importarProductosBatch,
  type ProductoExtraido,
} from '@/services/importar'
import type { Categoria } from '@/types/categoria'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos locales (producto editable en la tabla de revisión)
// ─────────────────────────────────────────────────────────────────────────────

interface ProductoEditable extends ProductoExtraido {
  _id: string        // ID local para tracking
  seleccionado: boolean
  nombre_editado: string
  descripcion_editada: string
  categoria_id: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge de confianza
// ─────────────────────────────────────────────────────────────────────────────

function ConfianzaBadge({ valor }: { valor: number }) {
  const color =
    valor >= 0.8
      ? 'bg-green-100 text-green-700'
      : valor >= 0.5
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'
  const label =
    valor >= 0.8 ? 'Alta' : valor >= 0.5 ? 'Media' : valor > 0 ? 'Baja' : 'Sin match'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ paso }: { paso: 1 | 2 | 3 }) {
  const pasos = [
    { n: 1, label: 'Subir PDF' },
    { n: 2, label: 'Revisar' },
    { n: 3, label: 'Confirmar' },
  ]
  return (
    <div className="flex items-center gap-0">
      {pasos.map((p, i) => (
        <div key={p.n} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                paso === p.n
                  ? 'bg-primary text-primary-foreground'
                  : paso > p.n
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {paso > p.n ? <CheckCircle className="size-4" /> : p.n}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                paso === p.n ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {p.label}
            </span>
          </div>
          {i < pasos.length - 1 && (
            <div className={`mx-3 h-px w-8 sm:w-12 ${paso > p.n ? 'bg-green-400' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso 1 — Upload
// ─────────────────────────────────────────────────────────────────────────────

function PasoUpload({
  onExtraer,
}: {
  onExtraer: (archivo: File) => void
}) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Solo se aceptan archivos PDF')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10 MB')
      return
    }
    setArchivo(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleExtraer = async () => {
    if (!archivo) return
    setCargando(true)
    try {
      await onExtraer(archivo)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
          drag
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
      >
        <FileUp className={`size-10 ${drag ? 'text-primary' : 'text-muted-foreground/40'}`} />
        <div className="text-center">
          <p className="font-medium text-foreground">
            {archivo ? archivo.name : 'Arrastra tu PDF aquí'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {archivo
              ? `${(archivo.size / 1024).toFixed(0)} KB · haz clic para cambiar`
              : 'o haz clic para seleccionar · máximo 10 MB'}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      {archivo && (
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Package className="size-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{archivo.name}</p>
              <p className="text-xs text-muted-foreground">{(archivo.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setArchivo(null) }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!archivo || cargando}
        onClick={handleExtraer}
      >
        {cargando ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Extrayendo productos…
          </>
        ) : (
          <>
            <Upload className="size-4 mr-2" />
            Extraer productos
          </>
        )}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso 2 — Revisión
// ─────────────────────────────────────────────────────────────────────────────

function PasoRevision({
  productos,
  setProductos,
  advertencias,
  categorias,
  onSiguiente,
  onVolver,
}: {
  productos: ProductoEditable[]
  setProductos: React.Dispatch<React.SetStateAction<ProductoEditable[]>>
  advertencias: string[]
  categorias: Categoria[]
  onSiguiente: () => void
  onVolver: () => void
}) {
  const seleccionados = productos.filter((p) => p.seleccionado).length
  const todosSeleccionados = seleccionados === productos.length

  const toggleTodos = () => {
    const nuevoValor = !todosSeleccionados
    setProductos((prev) => prev.map((p) => ({ ...p, seleccionado: nuevoValor })))
  }

  const toggleFila = (id: string) => {
    setProductos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, seleccionado: !p.seleccionado } : p))
    )
  }

  const editarCampo = (id: string, campo: 'nombre_editado' | 'descripcion_editada' | 'categoria_id', valor: string) => {
    setProductos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, [campo]: valor } : p))
    )
  }

  const eliminarFila = (id: string) => {
    setProductos((prev) => prev.filter((p) => p._id !== id))
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Package className="size-10 mx-auto text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">No se extrajeron productos del PDF.</p>
        <Button variant="outline" onClick={onVolver}>Volver e intentar con otro PDF</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Advertencias */}
      {advertencias.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 space-y-1">
          {advertencias.map((a, i) => (
            <p key={i} className="text-sm text-yellow-800 flex items-start gap-2">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              {a}
            </p>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded"
              checked={todosSeleccionados}
              onChange={toggleTodos}
            />
            Seleccionar todos
          </label>
          <span className="text-sm text-muted-foreground">
            {seleccionados} de {productos.length} seleccionados
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onVolver}>Volver</Button>
          <Button
            size="sm"
            disabled={seleccionados === 0}
            onClick={onSiguiente}
          >
            Continuar con {seleccionados} producto{seleccionados !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-10 px-3 py-2.5" />
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Nombre</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Descripción</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Categoría</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Confianza</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {productos.map((prod) => (
              <tr
                key={prod._id}
                className={prod.seleccionado ? 'bg-primary/5' : 'hover:bg-muted/20 transition-colors'}
              >
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={prod.seleccionado}
                    onChange={() => toggleFila(prod._id)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    value={prod.nombre_editado}
                    onChange={(e) => editarCampo(prod._id, 'nombre_editado', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    value={prod.descripcion_editada}
                    placeholder="Sin descripción"
                    onChange={(e) => editarCampo(prod._id, 'descripcion_editada', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="w-full rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={prod.categoria_id}
                    onChange={(e) => editarCampo(prod._id, 'categoria_id', e.target.value)}
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <ConfianzaBadge valor={prod.confianza} />
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => eliminarFila(prod._id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso 3 — Confirmar
// ─────────────────────────────────────────────────────────────────────────────

function PasoConfirmar({
  productos,
  categorias,
  onVolver,
  onImportar,
  importando,
}: {
  productos: ProductoEditable[]
  categorias: Categoria[]
  onVolver: () => void
  onImportar: () => void
  importando: boolean
}) {
  const seleccionados = productos.filter((p) => p.seleccionado)
  const conCat = seleccionados.filter((p) => p.categoria_id).length
  const sinCat = seleccionados.length - conCat

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
        <p className="font-semibold text-foreground">Resumen de importación</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Productos a crear</span>
            <span className="font-medium">{seleccionados.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Con categoría asignada</span>
            <span className="font-medium text-green-600">{conCat}</span>
          </div>
          {sinCat > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sin categoría</span>
              <span className="font-medium text-yellow-600">{sinCat}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista previa */}
      <ul className="rounded-xl border divide-y overflow-hidden max-h-60 overflow-y-auto">
        {seleccionados.map((p) => {
          const cat = categorias.find((c) => c.id === p.categoria_id)
          return (
            <li key={p._id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <Package className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{p.nombre_editado}</p>
                {cat && <p className="text-xs text-muted-foreground">{cat.nombre}</p>}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onVolver} disabled={importando}>
          Volver a revisar
        </Button>
        <Button className="flex-1" onClick={onImportar} disabled={importando}>
          {importando ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Importando…
            </>
          ) : (
            `Confirmar e importar ${seleccionados.length} producto${seleccionados.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Éxito
// ─────────────────────────────────────────────────────────────────────────────

function PasoExito({ cantidad, onNueva }: { cantidad: number; onNueva: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="rounded-full bg-green-100 p-4">
        <CheckCircle className="size-10 text-green-600" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">
          ¡{cantidad} producto{cantidad !== 1 ? 's' : ''} importado{cantidad !== 1 ? 's' : ''}!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ya aparecen en el catálogo. Puedes editarlos desde Productos.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onNueva}>Importar otro PDF</Button>
        <Button onClick={() => navigate('/admin/productos')}>Ver productos</Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principal
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminImportarPage() {
  const [paso, setPaso] = useState<1 | 2 | 3 | 'exito'>(1)
  const [productos, setProductos] = useState<ProductoEditable[]>([])
  const [advertencias, setAdvertencias] = useState<string[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [importando, setImportando] = useState(false)
  const [cantidadImportada, setCantidadImportada] = useState(0)
  const [cargandoCats, setCargandoCats] = useState(true)

  useEffect(() => {
    categoriasService
      .listar()
      .then(setCategorias)
      .catch(() => toast.error('No se pudieron cargar las categorías'))
      .finally(() => setCargandoCats(false))
  }, [])

  const handleExtraer = async (archivo: File) => {
    const resultado = await extraerProductosDePdf(archivo)
    const editables: ProductoEditable[] = resultado.productos.map((p, i) => ({
      ...p,
      _id: `${i}-${Date.now()}`,
      seleccionado: true,
      nombre_editado: p.nombre,
      descripcion_editada: p.descripcion_sugerida ?? '',
      categoria_id: p.categoria_id_sugerida ?? '',
    }))
    setProductos(editables)
    setAdvertencias(resultado.advertencias)
    setPaso(2)
    if (resultado.productos.length === 0) {
      toast.warning('No se encontraron productos en el PDF')
    } else {
      toast.success(`${resultado.productos.length} productos extraídos del PDF`)
    }
  }

  const handleImportar = async () => {
    const seleccionados = productos.filter((p) => p.seleccionado)
    if (seleccionados.length === 0) return

    setImportando(true)
    try {
      await importarProductosBatch(
        seleccionados.map((p) => ({
          nombre: p.nombre_editado || p.nombre,
          descripcion: p.descripcion_editada || p.nombre_editado || p.nombre,
          categorias: p.categoria_id ? [p.categoria_id] : [],
        }))
      )
      setCantidadImportada(seleccionados.length)
      setPaso('exito')
    } catch {
      toast.error('Error al importar los productos')
    } finally {
      setImportando(false)
    }
  }

  const resetear = () => {
    setProductos([])
    setAdvertencias([])
    setPaso(1)
  }

  if (cargandoCats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Importar productos desde PDF</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sube un catálogo o lista de productos en PDF y el sistema extraerá los productos automáticamente.
        </p>
      </div>

      {/* Steps */}
      {paso !== 'exito' && (
        <StepIndicator paso={paso as 1 | 2 | 3} />
      )}

      {/* Contenido por paso */}
      {paso === 1 && <PasoUpload onExtraer={handleExtraer} />}
      {paso === 2 && (
        <PasoRevision
          productos={productos}
          setProductos={setProductos}
          advertencias={advertencias}
          categorias={categorias}
          onSiguiente={() => setPaso(3)}
          onVolver={() => setPaso(1)}
        />
      )}
      {paso === 3 && (
        <PasoConfirmar
          productos={productos}
          categorias={categorias}
          onVolver={() => setPaso(2)}
          onImportar={handleImportar}
          importando={importando}
        />
      )}
      {paso === 'exito' && (
        <PasoExito cantidad={cantidadImportada} onNueva={resetear} />
      )}
    </div>
  )
}
