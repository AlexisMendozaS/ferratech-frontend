/**
 * Lo que necesita la ficha de un producto además del producto: su sección y familia, la ruta de
 * migas y los productos relacionados. Lo usan la página pública y la vista previa del panel.
 */
import { api } from '@/lib/api'
import type { Categoria } from '@/types/categoria'
import type { ProductoPublico, ProductoTarjeta } from '@/types/producto'

export interface DatosFicha {
  familia: Categoria | undefined
  seccion: Categoria | undefined
  ruta: { nombre: string; ruta: string }[]
  relacionados: ProductoTarjeta[]
}

export async function datosDeFicha(p: ProductoPublico): Promise<DatosFicha> {
  const categorias = await api.categorias()
  const porId = new Map(categorias.map((c) => [c.id, c]))
  const familia = p.categoria_principal ? porId.get(p.categoria_principal) : undefined
  const seccion = familia?.padre ? porId.get(familia.padre) : undefined

  // Relacionados: los elegidos en el panel y, si faltan, otros de la misma familia.
  const elegidos = (await Promise.all([...p.alternativas, ...p.relacionados].slice(0, 8).map((id) => api.producto(id).catch(() => null))))
    .filter((x) => x !== null)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      nombre: r.nombre,
      descripcion_corta: r.descripcion_corta,
      imagen: r.galeria[0] ?? null,
      categoria_principal: r.categoria_principal,
      disponibilidad: r.disponibilidad,
      num_variantes: r.variantes.length,
    })) as ProductoTarjeta[]
  let relacionados = elegidos
  if (relacionados.length < 4 && familia) {
    const misma = await api.buscar({ categoria: familia.slug, limit: 8 })
    const vistos = new Set([p.id, ...relacionados.map((r) => r.id)])
    relacionados = [...relacionados, ...misma.productos.filter((r) => !vistos.has(r.id))].slice(0, 8)
  }

  const ruta = [
    { nombre: 'Inicio', ruta: '/' },
    ...(seccion ? [{ nombre: seccion.nombre, ruta: `/categoria/${seccion.slug}` }] : []),
    ...(familia ? [{ nombre: familia.nombre, ruta: `/categoria/${familia.slug}` }] : []),
    { nombre: p.nombre, ruta: `/producto/${p.slug}` },
  ]
  return { familia, seccion, ruta, relacionados }
}
