/**
 * Prueba de humo: la app arranca, habla con el backend y protege el panel.
 * Es la base mínima de INI-001; las pruebas de cada flujo llegan con su iniciativa (INI-010).
 */
import { expect, test } from '@playwright/test'

test('la portada carga, muestra el buscador y no hay errores de JavaScript', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))

  const respuestaApi = page.waitForResponse(
    (r) => r.url().includes(':8001/') && r.request().method() === 'GET',
  )
  await page.goto('/')

  await expect(page).toHaveTitle(/FerraTech/)
  // En móvil el buscador puede estar dentro del menú; basta con que exista en la página.
  await expect(page.getByPlaceholder('Buscar productos...').first()).toBeAttached()
  expect((await respuestaApi).ok(), 'el backend respondió a la portada').toBeTruthy()
  expect(errores, 'errores de JavaScript en la página').toEqual([])
})

test('buscar desde la URL lleva al listado de productos', async ({ page }) => {
  await page.goto('/productos?q=taladro')
  await expect(page).toHaveURL(/\/productos\?q=taladro/)
  await expect(page.getByText(/taladro/i).first()).toBeVisible()
})

test('el panel de administración sin sesión redirige al login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login$/)
})
