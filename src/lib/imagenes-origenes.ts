/**
 * Lo comparten `astro.config.mjs` (configura el optimizador de imágenes de Vercel) y
 * `src/lib/imagenes.ts` (arma las URL). Solo se optimizan imágenes de estos dominios: Vercel
 * rechaza cualquier otro, así que una imagen de otro origen se sirve tal cual.
 */

/** Vercel Blob, donde el panel y `scripts/catalogo.py` suben las fotos del catálogo. */
export const DOMINIOS_IMAGENES = ['smsk0hnid0bjsn2p.public.blob.vercel-storage.com']

/** Anchos que Vercel puede generar; los `srcset` solo usan estos. */
export const ANCHOS_IMAGENES = [256, 384, 512, 640, 828, 1080]
