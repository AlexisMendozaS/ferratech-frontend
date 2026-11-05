/**
 * Valores del formulario de producto y su conversión con la API.
 * Modelo: docs/avances/catalogo/modelo_de_producto.md
 *
 * El formulario usa formas cómodas de editar (una línea por ventaja, opciones separadas por
 * coma, medidas por variante como columnas de una tabla) y aquí se traducen al modelo.
 */
import type {
  Disponibilidad,
  EstadoProducto,
  GrupoEspecificaciones,
  Imagen,
  ProductoAdmin,
  ProductoEntrada,
  UnidadVenta,
  VarianteEntrada,
} from '@/types/producto'

export interface FormProveedor {
  nombre: string
  clave: string
  costo: string
}

export interface FormVariante {
  sku: string
  valores: Record<string, string>
  /** Un valor por cada columna de `FormProducto.columnas`. */
  medidas: string[]
  unidad_venta: UnidadVenta
  venta_minima: string
  disponibilidad: '' | Disponibilidad
  imagen: string
  precio_referencia: string
  proveedores: FormProveedor[]
}

export interface FormProducto {
  nombre: string
  slug: string
  categoria_principal: string
  categorias: string[]
  descripcion_corta: string
  descripcion: string
  ventajas: string
  aplicaciones: string
  galeria: Imagen[]
  grupos: { grupo: string; filas: string }[]
  ejes: { nombre: string; opciones: string }[]
  columnas: { clave: string; unidad: string }[]
  variantes: FormVariante[]
  disponibilidad: Disponibilidad
  sinonimos: string
  terminos: string
  meta_titulo: string
  meta_descripcion: string
  interno: {
    marca: string
    modelo: string
    fabricante: string
    fuente_documento: string
    fuente_pagina: string
    notas: string
  }
  /** Se conservan tal cual al editar (todavía sin editor en el panel). */
  alternativas: string[]
  relacionados: string[]
}

// ── Utilidades ───────────────────────────────────────────────────────────────

export const lineas = (texto: string) => texto.split('\n').map((l) => l.trim()).filter(Boolean)
export const separadasPorComa = (texto: string) => texto.split(',').map((l) => l.trim()).filter(Boolean)
const nulo = (texto: string) => (texto.trim() ? texto.trim() : null)
const numero = (texto: string) => (texto.trim() === '' ? null : Number(texto))
const claveColumna = (c: { clave: string; unidad?: string | null }) => `${c.clave}|${c.unidad ?? ''}`
export const claveVariante = (valores: Record<string, string>) =>
  Object.keys(valores).sort().map((k) => `${k}=${valores[k]}`).join('&')

export function varianteVacia(valores: Record<string, string>, columnas: number, unidad: UnidadVenta = 'pieza'): FormVariante {
  return {
    sku: '', valores, medidas: Array(columnas).fill(''), unidad_venta: unidad, venta_minima: '',
    disponibilidad: '', imagen: '', precio_referencia: '', proveedores: [],
  }
}

/** Todas las combinaciones de los ejes, conservando los datos de las variantes que ya existían. */
export function generarVariantes(ejes: FormProducto['ejes'], actuales: FormVariante[], columnas: number): FormVariante[] {
  const limpios = ejes.map((e) => ({ nombre: e.nombre.trim(), opciones: separadasPorComa(e.opciones) })).filter((e) => e.nombre && e.opciones.length)
  let combinaciones: Record<string, string>[] = [{}]
  for (const eje of limpios) {
    combinaciones = combinaciones.flatMap((c) => eje.opciones.map((op) => ({ ...c, [eje.nombre]: op })))
  }
  const porClave = new Map(actuales.map((v) => [claveVariante(v.valores), v]))
  const unidad = actuales[0]?.unidad_venta ?? 'pieza'
  return combinaciones.map((valores) => porClave.get(claveVariante(valores)) ?? varianteVacia(valores, columnas, unidad))
}

// ── API → formulario ─────────────────────────────────────────────────────────

export function aFormulario(p?: ProductoAdmin): FormProducto {
  if (!p) {
    return {
      nombre: '', slug: '', categoria_principal: '', categorias: [], descripcion_corta: '', descripcion: '',
      ventajas: '', aplicaciones: '', galeria: [], grupos: [], ejes: [], columnas: [],
      variantes: [varianteVacia({}, 0)], disponibilidad: 'disponible', sinonimos: '', terminos: '',
      meta_titulo: '', meta_descripcion: '',
      interno: { marca: '', modelo: '', fabricante: '', fuente_documento: '', fuente_pagina: '', notas: '' },
      alternativas: [], relacionados: [],
    }
  }
  const columnas: FormProducto['columnas'] = []
  for (const v of p.variantes) {
    for (const f of v.especificaciones) {
      if (!columnas.some((c) => claveColumna(c) === claveColumna(f))) columnas.push({ clave: f.clave, unidad: f.unidad ?? '' })
    }
  }
  return {
    nombre: p.nombre,
    slug: p.slug,
    categoria_principal: p.categoria_principal ?? '',
    categorias: p.categorias,
    descripcion_corta: p.descripcion_corta ?? '',
    descripcion: p.descripcion ?? '',
    ventajas: p.ventajas.join('\n'),
    aplicaciones: p.aplicaciones.join('\n'),
    galeria: [...p.galeria].sort((a, b) => a.orden - b.orden),
    grupos: p.especificaciones.map((g) => ({
      grupo: g.grupo,
      filas: g.filas.map((f) => `${f.clave}: ${f.valor}${f.unidad ? ` ${f.unidad}` : ''}`).join('\n'),
    })),
    ejes: p.ejes.map((e) => ({ nombre: e.nombre, opciones: e.opciones.join(', ') })),
    columnas,
    variantes: p.variantes.map((v) => ({
      sku: v.sku,
      valores: v.valores,
      medidas: columnas.map((c) => v.especificaciones.find((f) => claveColumna(f) === claveColumna(c))?.valor ?? ''),
      unidad_venta: v.unidad_venta,
      venta_minima: v.venta_minima?.toString() ?? '',
      disponibilidad: v.disponibilidad ?? '',
      imagen: v.imagen ?? '',
      precio_referencia: v.interno.precio_referencia?.toString() ?? '',
      proveedores: v.interno.proveedores.map((pr) => ({ nombre: pr.nombre, clave: pr.clave ?? '', costo: pr.costo?.toString() ?? '' })),
    })),
    disponibilidad: p.disponibilidad,
    sinonimos: p.sinonimos.join('\n'),
    terminos: p.terminos.join('\n'),
    meta_titulo: p.meta_titulo ?? '',
    meta_descripcion: p.meta_descripcion ?? '',
    interno: {
      marca: p.interno.marca ?? '',
      modelo: p.interno.modelo ?? '',
      fabricante: p.interno.fabricante ?? '',
      fuente_documento: p.interno.fuente?.documento ?? '',
      fuente_pagina: p.interno.fuente?.pagina?.toString() ?? '',
      notas: p.interno.notas ?? '',
    },
    alternativas: p.alternativas,
    relacionados: p.relacionados,
  }
}

// ── Formulario → API ─────────────────────────────────────────────────────────

/** «Clave: valor» por línea. El valor puede llevar su unidad («270 cc»). */
function filas(texto: string): GrupoEspecificaciones['filas'] {
  return lineas(texto).map((l) => {
    const i = l.indexOf(':')
    return i > 0 ? { clave: l.slice(0, i).trim(), valor: l.slice(i + 1).trim() || '—' } : { clave: l, valor: '—' }
  })
}

export function aEntrada(f: FormProducto, estado: EstadoProducto): ProductoEntrada {
  const variantes: VarianteEntrada[] = f.variantes.map((v) => ({
    sku: nulo(v.sku),
    valores: v.valores,
    especificaciones: f.columnas
      .map((c, i) => ({ clave: c.clave.trim(), unidad: nulo(c.unidad), valor: (v.medidas[i] ?? '').trim() }))
      .filter((m) => m.clave && m.valor),
    unidad_venta: v.unidad_venta,
    venta_minima: numero(v.venta_minima),
    imagen: nulo(v.imagen),
    disponibilidad: v.disponibilidad || null,
    interno: {
      precio_referencia: numero(v.precio_referencia),
      proveedores: v.proveedores
        .filter((p) => p.nombre.trim())
        .map((p) => ({ nombre: p.nombre.trim(), clave: nulo(p.clave), costo: numero(p.costo) })),
    },
  }))
  const pagina = numero(f.interno.fuente_pagina)
  return {
    nombre: f.nombre,
    slug: nulo(f.slug),
    categoria_principal: nulo(f.categoria_principal),
    categorias: f.categorias.filter((c) => c !== f.categoria_principal),
    descripcion_corta: nulo(f.descripcion_corta),
    descripcion: nulo(f.descripcion),
    ventajas: lineas(f.ventajas),
    aplicaciones: lineas(f.aplicaciones),
    galeria: f.galeria.map((img, i) => ({ ...img, orden: i })),
    especificaciones: f.grupos.filter((g) => g.grupo.trim()).map((g) => ({ grupo: g.grupo.trim(), filas: filas(g.filas) })),
    ejes: f.ejes
      .map((e) => ({ nombre: e.nombre.trim(), opciones: separadasPorComa(e.opciones) }))
      .filter((e) => e.nombre && e.opciones.length),
    variantes,
    disponibilidad: f.disponibilidad,
    alternativas: f.alternativas,
    relacionados: f.relacionados,
    sinonimos: lineas(f.sinonimos),
    terminos: lineas(f.terminos),
    meta_titulo: nulo(f.meta_titulo),
    meta_descripcion: nulo(f.meta_descripcion),
    estado,
    interno: {
      marca: nulo(f.interno.marca),
      modelo: nulo(f.interno.modelo),
      fabricante: nulo(f.interno.fabricante),
      notas: nulo(f.interno.notas),
      fuente: f.interno.fuente_documento.trim() ? { documento: f.interno.fuente_documento.trim(), pagina } : null,
    },
  }
}

/** Lo mismo que valida el backend (`requisitos_para_publicar`), para mostrarlo mientras se edita. */
export function faltantesParaPublicar(f: FormProducto): string[] {
  const faltan: string[] = []
  if (!f.categoria_principal) faltan.push('Categoría principal')
  if (!f.descripcion_corta.trim()) faltan.push('Descripción corta')
  if (!f.descripcion.trim()) faltan.push('Descripción')
  if (f.galeria.length === 0) faltan.push('Al menos una imagen')
  else if (f.galeria.some((g) => !g.alt.trim())) faltan.push('Texto alternativo en todas las imágenes')
  if (f.variantes.length === 0) faltan.push('Al menos una variante')
  return faltan
}
