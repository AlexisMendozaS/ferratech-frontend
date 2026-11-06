/**
 * El flujo que vende (INI-010): buscar → ver el producto → agregarlo → enviar la cotización.
 * Corre en escritorio y en móvil (Pixel 7). Crea su propia categoría y producto por la API del
 * panel, y al terminar borra todo, incluida la cotización enviada.
 *
 * Con E2E_CAPTURAS=<carpeta> guarda las capturas del informe (`cotizar_<proyecto>_NN_*.png`).
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type APIRequestContext, type Page, type TestInfo } from '@playwright/test'

import { BACKEND_URL, FRONTEND_URL, tokenDeAdministrador } from './entorno'

const API = { Authorization: `Bearer ${tokenDeAdministrador()}` }

interface Creados {
  categorias: string[]
  productos: string[]
  cotizaciones: string[]
}

async function crear(request: APIRequestContext, ruta: string, datos: object): Promise<{ id: string }> {
  const r = await request.post(`${BACKEND_URL}${ruta}`, { headers: API, data: datos })
  expect(r.ok(), await r.text()).toBeTruthy()
  return r.json()
}

function capturador(page: Page, info: TestInfo) {
  const carpeta = process.env.E2E_CAPTURAS
  let n = 0
  return async (nombre: string) => {
    if (!carpeta) return
    mkdirSync(carpeta, { recursive: true })
    n += 1
    await page.screenshot({ path: path.join(carpeta, `cotizar_${info.project.name}_${String(n).padStart(2, '0')}_${nombre}.png`) })
  }
}

test('buscar, ver el producto, agregarlo y enviar la cotización', async ({ page, request }, info) => {
  const sufijo = Math.random().toString(36).slice(2, 7)
  const nombre = `Castillo armado e2e ${sufijo}`
  const correo = `cliente-${sufijo}@pruebas-ferratech.com`
  const creados: Creados = { categorias: [], productos: [], cotizaciones: [] }
  const captura = capturador(page, info)

  try {
    const seccion = await crear(request, '/categorias/', { nombre: `Acero e2e ${sufijo}`, padre: null })
    creados.categorias.unshift(seccion.id)
    const familia = await crear(request, '/categorias/', { nombre: `Armados e2e ${sufijo}`, padre: seccion.id })
    creados.categorias.unshift(familia.id)
    const producto = await crear(request, '/admin/productos', {
      nombre,
      categoria_principal: familia.id,
      descripcion_corta: 'Armado de varilla listo para colar castillos y dalas.',
      descripcion: 'Armado electrosoldado de varilla corrugada con estribos, en tramos de 6 m.',
      galeria: [{ url: `${FRONTEND_URL}/favicon.svg`, alt: 'Castillo armado', orden: 0 }],
      variantes: [{ unidad_venta: 'pieza' }],
      estado: 'publicado',
    })
    creados.productos.push(producto.id)

    // ── Cliente: busca desde la portada ───────────────────────────────────────
    await page.goto('/')
    const buscador = page.getByRole('combobox').first()
    await buscador.fill(`castillo armado ${sufijo}`)
    await captura('busca_desde_la_portada')
    await buscador.press('Enter')
    await expect(page).toHaveURL(/\/\?q=castillo/)
    const resultado = page.getByRole('link', { name: nombre })
    await expect(resultado).toBeVisible()
    await captura('resultados')

    // ── Ve el producto y lo agrega ────────────────────────────────────────────
    await resultado.click()
    await expect(page.getByRole('heading', { level: 1, name: nombre })).toBeVisible()
    await page.getByRole('button', { name: 'Agregar a mi cotización' }).click()
    await expect(page.getByText('Agregado a tu cotización')).toBeVisible()
    await captura('producto_agregado')

    // ── Envía la cotización ───────────────────────────────────────────────────
    await page.goto('/cotizacion')
    await expect(page.getByRole('heading', { level: 1, name: /Mi cotización/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: nombre })).toBeVisible()
    await captura('mi_cotizacion')
    await page.getByRole('button', { name: 'Solicitar cotización' }).click()
    await page.getByLabel('Nombre completo').fill('Cliente de Prueba')
    await page.getByLabel('Teléfono').fill('7711234567')
    await page.getByLabel('Correo electrónico').fill(correo)
    await page.getByLabel('¿En qué estado es la obra?').selectOption('Hidalgo')
    await captura('formulario_lleno')
    await page.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(page.getByText('¡Cotización enviada!')).toBeVisible()
    await captura('enviada')

    // ── Lo que recibe el vendedor ─────────────────────────────────────────────
    const lista = await (await request.get(`${BACKEND_URL}/cotizaciones/`, { headers: API })).json()
    const enviada = lista.find((c: { cliente: { email: string } }) => c.cliente.email === correo)
    expect(enviada, 'la cotización no llegó al backend').toBeTruthy()
    creados.cotizaciones.push(enviada.id)
    expect(enviada.estado).toBe('pendiente')
    expect(enviada.cliente.estado_republica).toBe('Hidalgo')
    expect(enviada.detalle).toEqual([expect.objectContaining({ nombre_producto: nombre, cantidad: 1 })])
  } finally {
    for (const id of creados.cotizaciones) await request.delete(`${BACKEND_URL}/cotizaciones/${id}`, { headers: API })
    for (const id of creados.productos) await request.delete(`${BACKEND_URL}/admin/productos/${id}`, { headers: API })
    for (const id of creados.categorias) await request.delete(`${BACKEND_URL}/categorias/${id}`, { headers: API })
  }
})
