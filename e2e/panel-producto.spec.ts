/**
 * Alta de un producto completo en el panel → publicación → página pública, búsqueda y cotización.
 * También comprueba DEC-012: lo capturado en «Interno» no aparece en el sitio.
 * INI-003 (alta profesional) e INI-010 (pruebas E2E). Solo escritorio (el panel es de escritorio).
 *
 * Con E2E_CAPTURAS=<carpeta> guarda las capturas numeradas del informe.
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { BACKEND_URL, FRONTEND_URL, sesionGuardada, tokenDeAdministrador } from './entorno'

const SUFIJO = Math.random().toString(36).slice(2, 7)
const NOMBRE = `Alambre pulido e2e ${SUFIJO}`
const MARCA_SECRETA = `MARCA-SECRETA-${SUFIJO}`
const PROVEEDOR_SECRETO = `PROVEEDOR-SECRETO-${SUFIJO}`
const TOKEN = tokenDeAdministrador()
const API = { Authorization: `Bearer ${TOKEN}` }

const creados: { categorias: string[]; productos: string[] } = { categorias: [], productos: [] }
let familia = { id: '', nombre: '' }

const capturas = process.env.E2E_CAPTURAS
let numero = 0
async function captura(page: Page, nombre: string) {
  if (!capturas) return
  mkdirSync(capturas, { recursive: true })
  numero += 1
  await page.screenshot({ path: path.join(capturas, `${String(numero).padStart(2, '0')}_${nombre}.png`), fullPage: true })
}

async function crearCategoria(request: APIRequestContext, nombre: string, padre?: string) {
  const r = await request.post(`${BACKEND_URL}/categorias/`, { headers: API, data: { nombre, padre: padre ?? null, descripcion: `Prueba E2E ${SUFIJO}` } })
  expect(r.ok(), await r.text()).toBeTruthy()
  const c = await r.json()
  creados.categorias.unshift(c.id) // las familias se borran antes que su sección
  return c
}

test.beforeAll(async ({ request }) => {
  const seccion = await crearCategoria(request, `Productos de acero e2e ${SUFIJO}`)
  familia = await crearCategoria(request, `Alambres e2e ${SUFIJO}`, seccion.id)
})

test.afterAll(async ({ request }) => {
  for (const id of creados.productos) await request.delete(`${BACKEND_URL}/admin/productos/${id}`, { headers: API })
  for (const id of creados.categorias) await request.delete(`${BACKEND_URL}/categorias/${id}`, { headers: API })
})

test('alta completa en el panel, publicación y página pública sin datos internos', async ({ page }) => {
  // Sesión de administrador simulada: el mismo valor que guarda el login real.
  await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)

  // ── General ────────────────────────────────────────────────────────────────
  await page.goto('/admin/productos/nuevo')
  await expect(page.getByRole('heading', { name: 'Nuevo producto' })).toBeVisible()
  await captura(page, 'formulario_nuevo_vacio')

  await page.locator('#nombre').fill(NOMBRE)
  await page.locator('#categoria_principal').selectOption({ label: familia.nombre })
  await page.locator('#descripcion_corta').fill('Alambre de acero liso y de acabado fino, en varios calibres.')
  await page.locator('#descripcion').fill('Alambre de acero de bajo carbono para parrillas, paneles y exhibidores.')
  await page.locator('#ventajas').fill('Diámetro uniforme\nSuperficie lisa')
  await page.locator('#aplicaciones').fill('Parrillas\nPaneles')

  // Publicar sin imagen: el formulario dice qué falta y no guarda.
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByRole('alert')).toContainText('Al menos una imagen')
  await captura(page, 'publicar_incompleto_dice_que_falta')

  // ── Imágenes ───────────────────────────────────────────────────────────────
  await page.getByRole('tab', { name: /Imágenes/ }).click()
  await page.getByPlaceholder(/pega la dirección de una imagen/).fill(`${FRONTEND_URL}/favicon.svg`)
  await page.getByRole('button', { name: 'Agregar' }).click()
  await page.getByLabel('Texto alternativo de la imagen 1').fill('Rollo de alambre pulido')
  await expect(page.getByRole('alert'), 'el aviso del intento anterior debe desaparecer al editar').toHaveCount(0)
  await captura(page, 'pestana_imagenes')

  // ── Variantes ──────────────────────────────────────────────────────────────
  await page.getByRole('tab', { name: /Variantes/ }).click()
  await page.getByRole('button', { name: 'Opción', exact: true }).click()
  await page.getByLabel('Nombre de la opción').fill('Calibre')
  await page.getByLabel('Valores').fill('16, 14')
  await page.getByRole('button', { name: 'Generar 2 variantes' }).click()
  await page.getByRole('button', { name: 'Columna de medida' }).click()
  await page.getByLabel('Nombre de la medida').fill('Diámetro')
  await page.getByLabel('Unidad de la medida').fill('mm')
  const medidas = page.getByLabel('Valor de la medida')
  await medidas.nth(0).fill('1.588')
  await medidas.nth(1).fill('2.032')
  for (const unidad of await page.getByLabel('Unidad de venta').all()) await unidad.selectOption('kg')
  await captura(page, 'pestana_variantes_con_medidas')

  // ── Interno (no se publica) ────────────────────────────────────────────────
  await page.getByRole('tab', { name: /Interno/ }).click()
  await page.locator('#marca').fill(MARCA_SECRETA)
  await page.getByRole('button', { name: 'Proveedor' }).first().click()
  await page.getByLabel('Proveedor', { exact: true }).first().fill(PROVEEDOR_SECRETO)
  await page.getByLabel('Costo').first().fill('31.5')
  await captura(page, 'pestana_interno')

  // ── Publicar ───────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByText('Producto publicado')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/productos\/[a-f0-9]{24}\/editar$/)
  creados.productos.push(page.url().split('/').at(-2)!)
  await expect(page.getByText('Publicado', { exact: true })).toBeVisible()
  await captura(page, 'publicado_en_el_panel')

  // ── Página pública ─────────────────────────────────────────────────────────
  const slug = `alambre-pulido-e2e-${SUFIJO}`
  await page.goto(`/producto/${slug}`)
  await expect(page.getByRole('heading', { level: 1, name: NOMBRE })).toBeVisible()
  await expect(page.getByText('Cotiza sin costo.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Medidas por variante' })).toBeVisible()
  await page.getByRole('radio', { name: '16' }).click()
  await expect(page.getByText(/Se vende por\s+kg/)).toBeVisible()
  const html = await page.content()
  expect(html, 'la marca interna se filtró al sitio').not.toContain(MARCA_SECRETA)
  expect(html, 'el proveedor interno se filtró al sitio').not.toContain(PROVEEDOR_SECRETO)
  expect(html, 'el costo interno se filtró al sitio').not.toContain('31.5')
  await captura(page, 'pagina_publica_variante_elegida')

  await page.getByRole('button', { name: 'Agregar a mi cotización' }).first().click()
  await expect(page.getByText('Agregado a tu cotización')).toBeVisible()

  // ── Búsqueda y carrito ─────────────────────────────────────────────────────
  await page.goto(`/productos?q=${SUFIJO}`)
  await expect(page.getByRole('link', { name: NOMBRE })).toBeVisible()
  await captura(page, 'busqueda_lo_encuentra')

  await page.goto('/carrito')
  await expect(page.getByText('Calibre 16')).toBeVisible()
  await captura(page, 'carrito_con_la_variante')
})
