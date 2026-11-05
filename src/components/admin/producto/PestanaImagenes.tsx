import { useRef, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { ArrowDown, ArrowUp, ImagePlus, Link2, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminProductosService, motivosDeError } from '@/services/adminProductos'
import { Seccion } from './campos'
import type { FormProducto } from './modelo'

export function PestanaImagenes() {
  const { control, register, watch } = useFormContext<FormProducto>()
  const { fields, append, remove, move } = useFieldArray({ control, name: 'galeria' })
  const [subiendo, setSubiendo] = useState(0)
  const [url, setUrl] = useState('')
  const archivo = useRef<HTMLInputElement>(null)
  const nombre = watch('nombre')

  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return
    const lista = Array.from(archivos)
    setSubiendo((n) => n + lista.length)
    for (const f of lista) {
      try {
        const subida = await adminProductosService.subirImagen(f)
        append({ url: subida, alt: '', orden: 0 })
      } catch (e) {
        toast.error(`No se pudo subir «${f.name}»`, { description: motivosDeError(e)[0] })
      } finally {
        setSubiendo((n) => n - 1)
      }
    }
    if (archivo.current) archivo.current.value = ''
  }

  const agregarUrl = () => {
    if (!/^https?:\/\//.test(url.trim())) {
      toast.error('La dirección de la imagen debe empezar con https://')
      return
    }
    append({ url: url.trim(), alt: '', orden: 0 })
    setUrl('')
  }

  return (
    <div className="flex flex-col gap-5">
      <Seccion
        titulo="Galería"
        descripcion="La primera imagen es la principal. Usa fotos propias o con licencia, sin logotipos ni marcas de agua (DEC-012)."
        accion={
          <Button type="button" onClick={() => archivo.current?.click()} disabled={subiendo > 0}>
            {subiendo > 0 ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {subiendo > 0 ? `Subiendo ${subiendo}…` : 'Subir imágenes'}
          </Button>
        }
      >
        <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => subir(e.target.files)} />

        {fields.length === 0 ? (
          <button
            type="button"
            onClick={() => archivo.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-12 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <ImagePlus className="size-8" />
            Sube al menos una imagen (JPG, PNG o WebP, hasta 5 MB)
          </button>
        ) : (
          <ul className="flex flex-col gap-3">
            {fields.map((f, i) => (
              <li key={f.id} className="flex gap-3 rounded-lg border border-border p-3">
                <img src={f.url} alt="" className="size-20 shrink-0 rounded-md border object-cover bg-muted" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {i === 0 && <Badge>Principal</Badge>}
                    <span className="truncate text-xs text-muted-foreground">{f.url}</span>
                  </div>
                  <Input
                    {...register(`galeria.${i}.alt` as const)}
                    placeholder={`Qué se ve: «${nombre || 'Rollo de alambre'} visto de frente»`}
                    aria-label={`Texto alternativo de la imagen ${i + 1}`}
                  />
                  {!watch(`galeria.${i}.alt`)?.trim() && <p className="text-xs text-amber-700">Falta el texto alternativo: lo necesitan Google Imágenes y los lectores de pantalla.</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Subir">
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label="Bajar">
                    <ArrowDown />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => remove(i)} aria-label="Quitar">
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…o pega la dirección de una imagen (https://…)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarUrl())} />
          <Button type="button" variant="outline" onClick={agregarUrl}>
            <Link2 /> Agregar
          </Button>
        </div>
      </Seccion>
    </div>
  )
}
