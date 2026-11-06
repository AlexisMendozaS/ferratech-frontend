/**
 * Si una página pública falla en el servidor (por ejemplo, el backend no responde), en lugar de un
 * error 500 se muestra «Estamos actualizando el catálogo» con estado 503 y `Retry-After`: para
 * Google es una caída temporal y no afecta la indexación. El panel y los archivos quedan fuera.
 */
import { AsyncLocalStorage } from 'node:async_hooks'
import { defineMiddleware } from 'astro:middleware'

const EXCLUIDAS = /^\/(admin|login|_astro|_image|mantenimiento)(\/|$)/

// IP del cliente de cada petición, para que `src/lib/api.ts` la pase al backend (límite de peticiones
// por cliente, INI-011). Va en globalThis para que api.ts no importe módulos de Node (también corre
// en el navegador).
const cliente = new AsyncLocalStorage<string | undefined>()
;(globalThis as { __ferratechCliente?: AsyncLocalStorage<string | undefined> }).__ferratechCliente = cliente

function ipDe(context: { clientAddress: string }): string | undefined {
  try {
    return context.clientAddress || undefined
  } catch {
    return undefined // páginas prerenderizadas: no hay cliente
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (EXCLUIDAS.test(context.url.pathname)) return next()

  let respuesta: Response
  try {
    respuesta = await cliente.run(ipDe(context), () => next())
  } catch (error) {
    console.error('Página pública con error', context.url.pathname, error)
    respuesta = new Response(null, { status: 500 })
  }
  if (respuesta.status < 500) return respuesta

  const aviso = await context.rewrite('/mantenimiento')
  const cabeceras = new Headers(aviso.headers)
  cabeceras.set('Retry-After', '120')
  cabeceras.set('Cache-Control', 'no-store')
  return new Response(aviso.body, { status: 503, headers: cabeceras })
})
