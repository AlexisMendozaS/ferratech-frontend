/**
 * Resumen del panel (INI-009): los eventos del sitio y las búsquedas llegan a los KPIs.
 * Navega el sitio como cliente (visita, búsqueda sin resultado, producto) y luego revisa el panel.
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

import { BACKEND_URL, sesionGuardada, tokenDeAdministrador } from './entorno'

const SUFIJO = Math.random().toString(36).slice(2, 7)
const BUSQUEDA = `martillo neumatico ${SUFIJO}`
const TOKEN = tokenDeAdministrador()

const capturas = process.env.E2E_CAPTURAS
async function captura(page: Page, nombre: string) {
  if (!capturas) return
  mkdirSync(capturas, { recursive: true })
  await page.screenshot({ path: path.join(capturas, `resumen_${nombre}.png`), fullPage: true })
}

test('la búsqueda sin resultado del sitio aparece como demanda no cubierta en el panel', async ({ page, request }) => {
  // ── Como cliente ───────────────────────────────────────────────────────────
  const visita = page.waitForRequest((r) => r.url() === `${BACKEND_URL}/eventos` && r.method() === 'POST')
  await page.goto(`/?q=${encodeURIComponent(BUSQUEDA)}`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No encontramos exactamente')
  expect((await visita).postDataJSON()).toMatchObject({ tipo: 'visita' })

  // La cotización llega con el estado de la obra.
  const r = await request.post(`${BACKEND_URL}/cotizaciones/`, {
    data: {
      cliente: { nombre: 'Cliente E2E', telefono: '5512345678', email: 'e2e@pruebas-ferratech.com', estado_republica: 'Jalisco' },
      detalle: [{ id_producto: 'e2e', nombre_producto: `Producto E2E ${SUFIJO}`, cantidad: 2 }],
    },
  })
  expect(r.ok(), await r.text()).toBeTruthy()

  // ── Como vendedor ──────────────────────────────────────────────────────────
  await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible()
  await page.getByRole('button', { name: '7 días' }).click()
  await expect(page.getByRole('heading', { name: 'Demanda no cubierta' })).toBeVisible()
  await expect(page.getByText(BUSQUEDA).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Embudo de ventas' })).toBeVisible()
  await expect(page.getByText(`Producto E2E ${SUFIJO}`)).toBeVisible()
  await expect(page.getByText('Jalisco')).toBeVisible()
  await captura(page, 'panel')
})
