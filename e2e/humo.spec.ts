/**
 * Prueba de humo: el sitio arranca, arma sus páginas con datos del backend y protege el panel.
 * Es la base mínima de INI-001; las pruebas de cada flujo llegan con su iniciativa (INI-010).
 */
import { expect, test } from '@playwright/test'

test('la portada carga, muestra el buscador y no hay errores de JavaScript', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))

  const respuesta = await page.goto('/')
  expect(respuesta?.status()).toBe(200)

  await expect(page).toHaveTitle(/FerraTech/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Buscar productos' })).toBeVisible()
  // Las categorías salen del backend y vienen ya en el HTML (Astro, del lado del servidor).
  await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible()
  expect(errores, 'errores de JavaScript en la página').toEqual([])
})

test('la URL vieja de búsqueda redirige a la portada y nunca queda vacía', async ({ page }) => {
  await page.goto('/productos?q=taladro')
  await expect(page).toHaveURL(/\/\?q=taladro$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('taladro')
})

test('el panel de administración sin sesión redirige al login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test('la página de cobertura lista los estados prioritarios y los declara a Google', async ({ page, request }) => {
  await page.goto('/cobertura')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hidalgo')
  for (const estado of ['Hidalgo', 'Tlaxcala', 'Puebla', 'Veracruz', 'Ciudad de México', 'Estado de México']) {
    await expect(page.getByRole('heading', { level: 3, name: estado })).toBeVisible()
  }
  await expect(page.getByText('se acuerdan con el vendedor').first()).toBeVisible()
  const jsonld = await page.locator('script[type="application/ld+json"]').allTextContents()
  const organizacion = jsonld.map((t) => JSON.parse(t)).find((d) => d['@type'] === 'Organization')
  expect(organizacion.areaServed.map((a: { name: string }) => a.name)).toEqual(
    expect.arrayContaining(['Hidalgo', 'Tlaxcala', 'Puebla', 'Veracruz', 'Ciudad de México', 'Estado de México']),
  )
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/cobertura</loc>')
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Cobertura de entregas' })).toBeVisible()
})
