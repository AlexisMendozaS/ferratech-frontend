/**
 * Carga datos asíncronos atados a una "clave" (por ejemplo, los filtros de la URL).
 *
 * - `loading` se deriva comparando la clave pedida con la de la última respuesta,
 *   así el efecto no llama a setState de forma síncrona (regla react-hooks/set-state-in-effect).
 * - Mientras carga una clave nueva, `data` conserva el resultado anterior (no parpadea).
 * - Si la clave cambia antes de que responda la petición anterior, esa respuesta se descarta.
 * - `enabled = false` no hace la petición (por ejemplo, si falta un parámetro de la ruta).
 */
import { useEffect, useRef, useState } from 'react'

interface Resultado<T> {
  key: string | null
  data: T | null
  error: unknown
}

export function useAsyncData<T>(fetcher: () => Promise<T>, key: string, enabled = true) {
  const [resultado, setResultado] = useState<Resultado<T>>({ key: null, data: null, error: null })

  // Siempre la versión más reciente del fetcher, sin que sea dependencia del efecto.
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    if (!enabled) return
    let vigente = true
    fetcherRef.current().then(
      (data) => {
        if (vigente) setResultado({ key, data, error: null })
      },
      (error: unknown) => {
        if (vigente) setResultado((prev) => ({ key, data: prev.data, error }))
      },
    )
    return () => {
      vigente = false
    }
  }, [key, enabled])

  const alDia = resultado.key === key
  return {
    data: resultado.data,
    loading: enabled && !alDia,
    error: alDia ? resultado.error : null,
  }
}
