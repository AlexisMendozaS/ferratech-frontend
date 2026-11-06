/**
 * Recorrido de todas las pantallas del panel (INI-009) con datos realistas, en escritorio y en
 * celular: cada pantalla carga, muestra sus datos, no se desborda a lo ancho y no tiene errores de
 * JavaScript. Crea sus datos por la API y los borra al terminar.
 *
 * Con E2E_CAPTURAS=<carpeta> guarda las capturas del informe (`panel_<vista>_NN_*.png`).
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { BACKEND_URL, FRONTEND_URL, sesionGuardada, tokenDeAdministrador } from './entorno'

const TOKEN = tokenDeAdministrador()
const API = { Authorization: `Bearer ${TOKEN}` }
const SUFIJO = Math.random().toString(36).slice(2, 7)

const creados = { categorias: [] as string[], productos: [] as string[], cotizaciones: [] as string[], leads: [] as string[] }
const nombres = {
  publicado: `Varilla corrugada e2e ${SUFIJO}`,
  borrador: `Malla ciclónica e2e ${SUFIJO}`,
  familia: `Varilla e2e ${SUFIJO}`,
  cliente: `Constructora Pruebas ${SUFIJO}`,
  lead: `Contacto Pruebas ${SUFIJO}`,
}

async function crear(request: APIRequestContext, ruta: string, datos: object, autenticado = true): Promise<{ id: string }> {
  const r = await request.post(`${BACKEND_URL}${ruta}`, { headers: autenticado ? API : {}, data: datos })
  expect(r.ok(), `${ruta}: ${await r.text()}`).toBeTruthy()
  return r.json()
}

test.beforeAll(async ({ request }) => {
  const seccion = await crear(request, '/categorias/', { nombre: `Acero e2e ${SUFIJO}`, padre: null, descripcion: 'Acero para construcción' })
  creados.categorias.unshift(seccion.id)
  const familia = await crear(request, '/categorias/', { nombre: nombres.familia, padre: seccion.id, descripcion: 'Varilla corrugada y lisa' })
  creados.categorias.unshift(familia.id)

  const imagen = [{ url: `${FRONTEND_URL}/favicon.svg`, alt: 'Varilla', orden: 0 }]
  const publicado = await crear(request, '/admin/productos', {
    nombre: nombres.publicado,
    categoria_principal: familia.id,
    descripcion_corta: 'Varilla de acero para reforzar concreto.',
    descripcion: 'Varilla corrugada grado 42 en tramos de 12 m.',
    galeria: imagen,
    ejes: [{ nombre: 'Medida', opciones: ['3/8"', '1/2"'] }],
    variantes: [
      { valores: { Medida: '3/8"' }, unidad_venta: 'pieza' },
      { valores: { Medida: '1/2"' }, unidad_venta: 'pieza' },
    ],
    estado: 'publicado',
  })
  creados.productos.push(publicado.id)
  const borrador = await crear(request, '/admin/productos', { nombre: nombres.borrador, categoria_principal: familia.id, estado: 'borrador' })
  creados.productos.push(borrador.id)

  const estados = [
    { estado: null, region: 'Hidalgo' },
    { estado: 'contactado', region: 'Puebla' },
    { estado: 'cerrada', region: 'Ciudad de México', monto: 48500 },
  ]
  for (const [i, e] of estados.entries()) {
    const c = await crear(
      request,
      '/cotizaciones/',
      {
        cliente: { nombre: `${nombres.cliente} ${i + 1}`, telefono: `77112345${60 + i}`, email: `panel${i}-${SUFIJO}@pruebas-ferratech.com`, estado_republica: e.region },
        detalle: [{ id_producto: publicado.id, nombre_producto: nombres.publicado, variante_seleccionada: 'Medida 3/8"', cantidad: 40 + i * 10 }],
      },
      false,
    )
    creados.cotizaciones.push(c.id)
    if (e.estado) {
      const r = await request.patch(`${BACKEND_URL}/cotizaciones/${c.id}`, { headers: API, data: { estado: e.estado, monto: e.monto ?? null } })
      expect(r.ok()).toBeTruthy()
    }
  }
  for (const [i, origen] of ['whatsapp', 'widget_lateral'].entries()) {
    const l = await crear(request, '/leads', { nombre: `${nombres.lead} ${i + 1}`, telefono: `22212345${70 + i}`, origen, notas: 'Necesita precio por tonelada' }, false)
    creados.leads.push(l.id)
  }
})

test.afterAll(async ({ request }) => {
  for (const id of creados.cotizaciones) await request.delete(`${BACKEND_URL}/cotizaciones/${id}`, { headers: API })
  for (const id of creados.leads) await request.delete(`${BACKEND_URL}/admin/leads/${id}`, { headers: API })
  for (const id of creados.productos) await request.delete(`${BACKEND_URL}/admin/productos/${id}`, { headers: API })
  for (const id of creados.categorias) await request.delete(`${BACKEND_URL}/categorias/${id}`, { headers: API })
})

const PANTALLAS = [
  { ruta: '/admin', titulo: 'Resumen', muestra: (p: Page) => p.getByRole('heading', { name: 'Embudo de ventas' }) },
  { ruta: '/admin/cotizaciones', titulo: 'Cotizaciones', muestra: (p: Page) => p.getByText(`${nombres.cliente} 1`).first() },
  { ruta: '/admin/leads', titulo: 'Contactos', muestra: (p: Page) => p.getByText(`${nombres.lead} 1`).first() },
  { ruta: '/admin/productos', titulo: 'Productos', muestra: (p: Page) => p.getByText(nombres.publicado).first() },
  { ruta: '/admin/categorias', titulo: 'Categorías', muestra: (p: Page) => p.getByText(nombres.familia).first() },
]

for (const vista of [
  { nombre: 'escritorio', viewport: { width: 1440, height: 900 } },
  { nombre: 'movil', viewport: { width: 390, height: 844 } },
]) {
  test(`todas las pantallas del panel cargan con sus datos (${vista.nombre})`, async ({ page }) => {
    await page.setViewportSize(vista.viewport)
    await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)
    const errores: string[] = []
    page.on('pageerror', (e) => errores.push(e.message))
    const carpeta = process.env.E2E_CAPTURAS
    let n = 0

    for (const pantalla of PANTALLAS) {
      await page.goto(pantalla.ruta)
      await expect(page.getByRole('heading', { level: 1, name: pantalla.titulo })).toBeVisible()
      await expect(pantalla.muestra(page)).toBeVisible()
      const desborda = await page.evaluate<boolean>('document.documentElement.scrollWidth > window.innerWidth + 1')
      expect(desborda, `${pantalla.ruta} se desborda a lo ancho en ${vista.nombre}`).toBe(false)
      if (carpeta) {
        mkdirSync(carpeta, { recursive: true })
        n += 1
        const nombre = pantalla.ruta.split('/').at(-1) || 'resumen'
        await page.screenshot({ path: path.join(carpeta, `panel_${vista.nombre}_${String(n).padStart(2, '0')}_${nombre === 'admin' ? 'resumen' : nombre}.png`), fullPage: true })
      }
    }
    expect(errores, 'errores de JavaScript en el panel').toEqual([])
  })
}

async function capturar(page: Page, nombre: string) {
  const carpeta = process.env.E2E_CAPTURAS
  if (!carpeta) return
  mkdirSync(carpeta, { recursive: true })
  await page.screenshot({ path: path.join(carpeta, `panel_${nombre}.png`) })
}

test('dar seguimiento: responder una cotización y borrar un contacto de spam', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)

  // El enlace al sitio es normal (lo sirve Astro), no una ruta del panel.
  await page.goto('/admin/cotizaciones')
  await expect(page.getByRole('link', { name: 'Ver el sitio' })).toHaveAttribute('href', '/')

  // Buscar al cliente y abrir su cotización.
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(`${nombres.cliente} 1`)
  await expect(page.getByRole('row')).toHaveCount(2) // encabezado + la cotización
  await page.getByRole('button', { name: `${nombres.cliente} 1` }).click()
  const detalle = page.getByRole('dialog')
  await expect(detalle.getByText('Hidalgo')).toBeVisible()
  await expect(detalle.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/527711234560')
  await capturar(page, 'seguimiento_01_detalle_cotizacion')
  await detalle.getByRole('button', { name: 'Marcar como respondida' }).click()
  await expect(detalle.getByText('Respondida', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('row').nth(1).getByText('Respondida', { exact: true })).toBeVisible()

  // Borrar un contacto de spam, con confirmación.
  await page.goto('/admin/leads')
  await page.getByRole('button', { name: `${nombres.lead} 2` }).click()
  await page.getByRole('button', { name: 'Borrar (spam o prueba)' }).click()
  await capturar(page, 'seguimiento_02_confirmar_borrado')
  await page.getByRole('alertdialog').getByRole('button', { name: 'Borrar' }).click()
  await expect(page.getByText('Contacto borrado')).toBeVisible()
  await expect(page.getByRole('button', { name: `${nombres.lead} 2` })).toHaveCount(0)
  await expect(page.getByRole('button', { name: `${nombres.lead} 1` })).toBeVisible()
})

test('si el servidor falla, la pantalla lo dice y deja reintentar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)
  let fallar = true
  await page.route(`${BACKEND_URL}/cotizaciones/`, (ruta) => (fallar && ruta.request().method() === 'GET' ? ruta.fulfill({ status: 500, body: '{}' }) : ruta.continue()))

  await page.goto('/admin/cotizaciones')
  const aviso = page.getByRole('alert').filter({ hasText: 'No se pudieron cargar las cotizaciones' })
  await expect(aviso).toBeVisible()
  await capturar(page, 'error_01_aviso_con_reintentar')
  fallar = false
  await aviso.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('button', { name: `${nombres.cliente} 1` })).toBeVisible()
})

test('las categorías se ven como secciones con sus familias y no se borra una sección con familias', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addInitScript(`window.localStorage.setItem('ferratech-auth', ${JSON.stringify(sesionGuardada(TOKEN))})`)
  await page.goto('/admin/categorias')
  const familias = page.getByRole('list', { name: `Familias de Acero e2e ${SUFIJO}` })
  await expect(familias.getByText(nombres.familia)).toBeVisible()
  await page.getByRole('button', { name: `Eliminar Acero e2e ${SUFIJO}` }).click()
  const aviso = page.getByRole('alertdialog')
  await expect(aviso).toContainText('no se puede eliminar todavía')
  await expect(aviso).toContainText('1 familia')
  await expect(aviso.getByRole('button', { name: 'Eliminar' })).toHaveCount(0)
  await capturar(page, 'categorias_01_borrado_bloqueado')
  await aviso.getByRole('button', { name: 'Entendido' }).click()
})
