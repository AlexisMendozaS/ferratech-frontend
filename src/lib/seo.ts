/**
 * Datos estructurados (schema.org) del sitio público. DEC-012: `Product` sin `brand` ni `offers`;
 * quien vende es FerraTech, como `Organization`.
 */
import { ESTADOS_PRIORITARIOS } from '@/lib/cobertura'
import type { ProductoPublico } from '@/types/producto'

export const NOMBRE_SITIO = 'FerraTech'
export const LEMA = 'Cotiza sin costo: te conseguimos el mejor precio'

export function organizacion(origen: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: NOMBRE_SITIO,
    url: origen,
    logo: `${origen}/favicon.svg`,
    // Estados prioritarios (INI-008, DEC-018) y, en general, todo México.
    areaServed: [
      ...ESTADOS_PRIORITARIOS.map((e) => ({ '@type': 'State', name: e.nombre, containedInPlace: { '@type': 'Country', name: 'México' } })),
      { '@type': 'Country', name: 'México' },
    ],
  }
}

export function sitioConBuscador(origen: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: NOMBRE_SITIO,
    url: origen,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${origen}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function migas(origen: string, pasos: { nombre: string; ruta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pasos.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.nombre,
      item: `${origen}${p.ruta}`,
    })),
  }
}

export function producto(origen: string, p: ProductoPublico, categoria: string | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nombre,
    description: p.descripcion_corta ?? p.descripcion ?? undefined,
    image: p.galeria.map((i) => i.url),
    url: `${origen}/producto/${p.slug}`,
    sku: p.variantes.length === 1 ? p.variantes[0].sku : undefined,
    category: categoria ?? undefined,
    ...(p.variantes.length > 1
      ? {
          hasVariant: p.variantes.map((v) => ({
            '@type': 'Product',
            sku: v.sku,
            name: [p.nombre, ...Object.values(v.valores)].join(' '),
          })),
        }
      : {}),
  }
}

/** Corta un texto en el último espacio antes de `max` caracteres. */
export function recortar(texto: string | null | undefined, max = 160): string {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const corte = t.lastIndexOf(' ', max - 1)
  return `${t.slice(0, corte > 40 ? corte : max - 1)}…`
}
