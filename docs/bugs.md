# Bugs y Hallazgos — Primera Entrega FerraTech

> Generado por revisión de código estática (2026-06-27).  
> Los flujos marcados con 🧪 requieren prueba manual con la app corriendo.

---

## 🐛 Bugs confirmados por revisión de código

### B-01 · Clase `xs:` inexistente en Navbar
**Archivo:** `ferratech-frontend/src/components/layout/Navbar.tsx`  
**Línea:** Logo `<span className="hidden xs:inline sm:inline">FerraTech</span>`  
**Problema:** `xs:` no está definido como breakpoint en Tailwind v4 del proyecto. La clase es ignorada.  
**Impacto:** El texto "FerraTech" queda oculto en pantallas < 640px (sólo se ve el ícono de llave). Comportamiento aceptable pero el `xs:inline` es código muerto.  
**Solución:** Cambiar a `<span className="hidden sm:inline">FerraTech</span>`.  
**Prioridad:** Baja.

---

### B-02 · Botón "Comprar Ahora" eliminado en ProductoDetallePage
**Archivo:** `ferratech-frontend/src/pages/ProductoDetallePage.tsx`  
**Problema:** Al implementar la barra sticky de mobile, el botón "Comprar Ahora" (Zap) fue omitido de la sección desktop.  
**Impacto:** En desktop sólo aparece "Añadir al Carrito". El botón "Comprar Ahora" no tiene funcionalidad de pago en la primera entrega, pero su ausencia altera la UI original.  
**Solución:** Restituir el botón en la sección `hidden sm:flex`, marcarlo como `disabled` con tooltip "Disponible próximamente" o retirarlo definitivamente del diseño.  
**Prioridad:** Media (decisión de diseño pendiente).

---

### B-03 · `CotizacionResponse` en frontend incompleta
**Archivo:** `ferratech-frontend/src/services/cotizaciones.ts`  
**Problema:** La interfaz `CotizacionResponse` define sólo `{ id: string; mensaje: string }` pero el backend devuelve `{ id, fecha, estado, cliente, detalle }`. No hay campo `mensaje`.  
**Impacto:** TypeScript acepta la respuesta porque el objeto extra es silenciado, pero si algún componente quisiera mostrar datos de la respuesta (fecha, estado) no podría via tipado.  
**Solución:** Actualizar la interfaz para reflejar la respuesta real del backend.  
**Prioridad:** Baja (no rompe funcionalidad actual, afecta futuro).

---

### B-04 · `Font` importado pero no usado en CotizacionPDF
**Archivo:** `ferratech-frontend/src/components/cotizacion/CotizacionPDF.tsx`  
**Problema:** `Font` se importa de `@react-pdf/renderer` pero no se usa.  
**Impacto:** Warning de lint/TS en modo estricto. No afecta funcionalidad.  
**Solución:** Eliminar `Font` del import.  
**Prioridad:** Baja.

---

### B-05 · CORS origins hardcoded en backend
**Archivo:** `ferratech-backend/app/core/config.py`  
**Problema:** `cors_origins` tiene default `"http://localhost:5173"`. En producción debe configurarse vía `.env`.  
**Impacto:** Si se despliega sin setear `CORS_ORIGINS`, el frontend en producción (Vercel) recibirá errores CORS.  
**Solución:** Asegurarse de que `.env` de producción incluya `CORS_ORIGINS=https://ferratech.vercel.app` (o el dominio final).  
**Prioridad:** Alta — bloquea despliegue.

---

## ✅ Checklist de flujos manuales

### Flujo 1 — Búsqueda y detalle de producto 🧪
- [ ] Buscar un término en el buscador del Navbar y verificar que redirige a `/productos?q=...`
- [ ] Aplicar un filtro de categoría y verificar que el grid se actualiza
- [ ] Abrir el detalle de un producto con variantes (ej. talla, color)
- [ ] Verificar que no se puede añadir al carrito sin seleccionar todas las variantes
- [ ] Seleccionar variantes, cambiar cantidad y añadir al carrito
- [ ] Verificar que el badge del carrito en Navbar se actualiza
- [ ] Recargar la página y verificar que el carrito persiste (localStorage)

### Flujo 2 — Carrito y cotización 🧪
- [ ] Ir a `/carrito` y verificar que aparecen los productos añadidos
- [ ] Incrementar / decrementar cantidades con los controles +/-
- [ ] Eliminar un ítem y verificar que desaparece
- [ ] Eliminar todos los ítems y verificar el estado vacío con link a /productos
- [ ] Hacer clic en "Solicitar cotización" y verificar que abre el modal
- [ ] Intentar enviar el form vacío y verificar errores de validación Zod
- [ ] Llenar el form correctamente y enviar
- [ ] Verificar que aparece la pantalla de éxito con botón "Descargar cotización (PDF)"
- [ ] Descargar el PDF y verificar que el nombre es `cotizacion-YYYY-MM-DD-{nombre}.pdf`
- [ ] Verificar que al cerrar el modal el carrito queda vacío

### Flujo 3 — Email y persistencia 🧪
- [ ] Verificar que el email de notificación llegó al agente de ventas (`SALES_AGENT_EMAIL`)
- [ ] Abrir MongoDB Atlas y verificar que la cotización aparece en colección `cotizaciones` con estado `"pendiente"`
- [ ] Comprobar campos: `cliente`, `detalle[].id_producto`, `detalle[].cantidad`, `fecha`, `estado`

### Flujo 4 — Panel administrador 🧪
- [ ] Ir a `/admin/categorias` y crear una nueva categoría
- [ ] Verificar que aparece en el filtro de la página `/productos`
- [ ] Ir a `/admin/productos` y crear un producto nuevo con variantes e imagen
- [ ] Verificar que el producto aparece en el catálogo (`/productos`)
- [ ] Abrir el detalle del producto recién creado y añadirlo al carrito

### Flujo 5 — Responsividad 🧪
- [ ] Abrir DevTools → modo mobile (375px) y verificar:
  - [ ] Hamburger menu funciona y abre Sheet lateral
  - [ ] Grid de productos es 1 columna
  - [ ] Barra sticky "Añadir al Carrito" visible en `/productos/{id}`
  - [ ] Galería de imágenes apilada verticalmente
- [ ] Tableta (768px): grid 2 columnas, sidebar filtros oculto (drawer)
- [ ] Desktop (1024px+): grid 4 columnas, sidebar filtros visible

### Flujo 6 — Consola y errores silenciosos 🧪
- [ ] Abrir consola del navegador y completar todos los flujos anteriores sin errores `console.error`
- [ ] Revisar Network tab: todas las llamadas a la API retornan 2xx
- [ ] Verificar que el endpoint `/health` del backend responde `{ "status": "ok" }`

---

## ⚠️ Limitaciones conocidas (por diseño, primera entrega)

| Limitación | Razón |
|---|---|
| No hay autenticación de usuarios | Fuera del scope de la primera entrega |
| Precios sólo a consultar (no checkout) | Sin pasarela de pago en esta fase |
| Panel admin sin protección de ruta | Auth pendiente para segunda entrega |
| PDF sin precios (campo `precio_unitario: null`) | Se integrará cuando el backend maneje precios por variante |
| "Comprar Ahora" sin implementar | Requiere pasarela de pago |
| Notificaciones (`Bell`) no funcionales | Módulo fuera del scope |

---

## 🔧 Correcciones pendientes antes del despliegue

1. **B-05 (CORS)** — Configurar `CORS_ORIGINS` en `.env` de producción del backend.
2. **B-01 (xs:)** — Limpiar clase `xs:inline` del Navbar.
3. **B-02 (Comprar Ahora)** — Decidir si se restituye como botón deshabilitado o se elimina del diseño.
4. Verificar que `RESEND_API_KEY` y `SALES_AGENT_EMAIL` estén seteados en el entorno de producción.
5. Verificar que `VITE_API_URL` apunte al backend desplegado en el build de Vercel.
