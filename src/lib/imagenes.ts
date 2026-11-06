/**
 * Fotos del catálogo al tamaño de la pantalla (INI-010: el LCP en móvil era de 3.1 s porque el
 * celular descargaba la foto de 1000 px). En Vercel pasan por su optimizador (`/_vercel/image`):
 * WebP al ancho pedido, en caché del CDN. En desarrollo y en las pruebas E2E se usa la URL original.
 */
import { ANCHOS_IMAGENES, DOMINIOS_IMAGENES } from '@/lib/imagenes-origenes'

const EN_VERCEL = import.meta.env.PROD && Boolean(process.env.VERCEL)

function optimizable(url: string): boolean {
  if (!EN_VERCEL) return false
  try {
    return DOMINIOS_IMAGENES.includes(new URL(url).hostname)
  } catch {
    return false
  }
}

const aVercel = (url: string, ancho: number) => `/_vercel/image?url=${encodeURIComponent(url)}&w=${ancho}&q=75`

export interface ImagenResponsiva {
  src: string
  srcset?: string
  sizes?: string
}

/**
 * `src`, `srcset` y `sizes` para un `<img>`. `anchos` debe salir de ANCHOS_IMAGENES; `sizes` dice
 * qué tan ancha se ve la imagen en la página, para que el navegador elija la más chica que basta.
 */
export function imagenResponsiva(url: string, anchos: number[], sizes: string): ImagenResponsiva {
  if (!optimizable(url)) return { src: url }
  const validos = anchos.filter((a) => ANCHOS_IMAGENES.includes(a))
  return {
    src: aVercel(url, validos.at(-1)!),
    srcset: validos.map((a) => `${aVercel(url, a)} ${a}w`).join(', '),
    sizes,
  }
}

/** Tarjetas de producto: dos columnas en el celular, hasta cuatro de ~300 px en escritorio. */
export const tarjeta = (url: string) => imagenResponsiva(url, [256, 384, 512], '(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw')

/** Imagen grande de la página de producto: todo el ancho en el celular, ~60 % en escritorio. */
export const principal = (url: string) => imagenResponsiva(url, [384, 512, 640, 828, 1080], '(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 100vw')

/** Miniaturas de la galería (64 px; 256 alcanza para pantallas de alta densidad). */
export const miniatura = (url: string) => imagenResponsiva(url, [256], '64px').src
