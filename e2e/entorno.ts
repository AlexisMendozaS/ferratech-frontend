/**
 * Valores compartidos entre `playwright.config.ts` y las pruebas E2E.
 * Solo para pruebas: el backend E2E arranca con este secreto y este administrador.
 */
import { createHmac } from 'node:crypto'

export const BACKEND_PORT = 8001
export const FRONTEND_PORT = 5174
export const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`
export const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`

export const JWT_SECRET_E2E = 'e2e-secreto-solo-para-pruebas-ferratech-0123456789'
export const ADMIN_E2E = 'admin@pruebas-ferratech.com'

const b64url = (datos: string | Buffer) => Buffer.from(datos).toString('base64url')

/** JWT HS256 como los que emite el backend (`create_access_token`). */
export function tokenDeAdministrador(horas = 1): string {
  const cabecera = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const cuerpo = b64url(JSON.stringify({ sub: ADMIN_E2E, exp: Math.floor(Date.now() / 1000) + horas * 3600 }))
  const firma = createHmac('sha256', JWT_SECRET_E2E).update(`${cabecera}.${cuerpo}`).digest('base64url')
  return `${cabecera}.${cuerpo}.${firma}`
}

/** Lo que guarda el store de autenticación (zustand persist, clave `ferratech-auth`). */
export const sesionGuardada = (token: string) => JSON.stringify({ state: { token }, version: 0 })
