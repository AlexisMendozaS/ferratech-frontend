/**
 * Vista previa de la página del producto desde el panel (INI-003): muestra la ficha real del sitio
 * con lo que hay en el formulario, sin guardar, sin lo interno (DEC-012) y sin contar en los KPIs.
 *
 * Con E2E_CAPTURAS=<carpeta> guarda las capturas del informe (`vista_previa_NN_*.png`).
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

import { BACKEND_URL, FRONTEND_URL, sesionGuardada, tokenDeAdministrador } from './entorno'

const TOKEN = tokenDeAdministrador()
const API = { Authorization: `Bearer ${TOKEN}` }
const SUFIJO = Math.random().toString(36).slice(2, 7)
const NOMBRE = `Malla electrosoldada e2e ${SUFIJO}`
const MARCA_SECRETA = `MARCA-SECRETA-${SUFIJO}`
const categorias: string[] = []

async function capturar(page: Page, n: number, nombre: string) {
  const carpeta = process.env.E2E_CAPTURAS
  if (!carpeta) return
  mkdirSync(carpeta, { recursive: true })
  await page.screenshot({ path: path.join(carpeta, `vista_previa_${String(n).padStart(2, '0')}_${nombre}.png`) })
}

test.afterAll(async ({ request }) => {
  for (const id of categorias) await request.delete(`${BACKEND_URL}/categorias/${id}`, { headers: API })
})

test('la vista previa muestra la ficha real sin guardar y sin lo interno', async ({ page, request }) => {
  const seccion = await (await request.post(`${BACKEND_URL}/categorias/`, { headers: API, data: { nombre: `Mallas e2e ${SUFIJO}`, padre: null } })).json()
  categorias.unshift(seccion.id)
  const familia = await (await request.post(`${BACKEND_URL}/categorias/`, { headers: API, data: { nombre: `Electrosoldada e2e ${SUFIJO}`, padre: seccion.id } })).json()
  categorias.unshift(familia.id)

  const eventos: string[] = []
  page.on('request', (r) => r.url().endsWith('/eventos') && eventos.push(r.url()))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)

  // Un producto a medio capturar: sin imagen ni variantes todavía (no se podría publicar).
  await page.goto('/admin/productos/nuevo')
  await page.locator('#nombre').fill(NOMBRE)
  await page.locator('#categoria_principal').selectOption({ label: familia.nombre })
  await page.locator('#descripcion_corta').fill('Malla de varilla soldada en cuadros de 6x6", para firmes y losas.')
  await page.locator('#descripcion').fill('Malla de acero electrosoldada para reforzar firmes, losas y muros.\n\nSe vende por hoja o por rollo.')
  await page.locator('#ventajas').fill('Ahorra tiempo de armado\nRefuerzo uniforme')
  await page.locator('#aplicaciones').fill('Firmes\nLosas')
  await page.getByRole('tab', { name: /Interno/ }).click()
  await page.locator('#marca').fill(MARCA_SECRETA)

  await page.getByRole('button', { name: 'Vista previa' }).click()
  const dialogo = page.getByRole('dialog', { name: 'Vista previa de la página' })
  await expect(dialogo).toBeVisible()
  const marco = page.frameLocator('iframe[name="vista-previa-producto"]')
  await expect(marco.getByRole('heading', { level: 1, name: NOMBRE })).toBeVisible()
  await expect(marco.getByText('Así se verá en el sitio.')).toBeVisible()
  await expect(marco.getByRole('navigation', { name: 'Ruta' })).toContainText(familia.nombre)
  await expect(marco.getByRole('heading', { name: 'Ventajas' })).toBeVisible()
  await expect(marco.locator('body')).not.toContainText(MARCA_SECRETA)
  await capturar(page, 1, 'escritorio')

  await dialogo.getByRole('button', { name: 'Celular' }).click()
  await expect(page.locator('iframe[name="vista-previa-producto"]')).toHaveCSS('width', '390px')
  await capturar(page, 2, 'celular')

  // No se guardó nada y la vista previa no contó como visita ni como producto visto.
  const lista = await (await request.get(`${BACKEND_URL}/admin/productos`, { headers: API, params: { q: NOMBRE } })).json()
  expect(lista.total).toBe(0)
  expect(eventos).toEqual([])

  // La página de vista previa no se abre sin pasar por el panel.
  const directa = await request.get(`${FRONTEND_URL}/vista-previa/producto`, { maxRedirects: 0 })
  expect(directa.status()).toBe(302)
})

test('la vista previa sin una sesión válida no muestra nada', async ({ request }) => {
  const r = await request.post(`${FRONTEND_URL}/vista-previa/producto`, {
    form: { token: 'token-falso', datos: JSON.stringify({ nombre: 'Producto inventado' }) },
    headers: { Origin: FRONTEND_URL },
  })
  const html = await r.text()
  expect(html).toContain('Tu sesión del panel expiró')
  expect(html).not.toContain('Producto inventado')
  expect(r.headers()['x-robots-tag']).toContain('noindex')
})
