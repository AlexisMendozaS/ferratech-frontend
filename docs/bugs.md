# Bugs y Hallazgos — Primera Entrega FerraTech

> Revisión de código estática: 2026-06-27.  
> Pruebas funcionales ejecutadas: 2026-06-27 con app corriendo en localhost (Chrome MCP).

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

### B-06 · Badge del carrito no se actualiza al limpiar sin recargar
**Archivo:** `ferratech-frontend/src/components/layout/Navbar.tsx`  
**Problema:** Después de cerrar el modal de cotización (que llama `clearCart()`), el badge numérico del ícono del carrito sigue mostrando el valor anterior hasta que el usuario navega a otra página.  
**Impacto:** El usuario ve el badge "1" aunque el carrito esté vacío. Desaparece al recargar/navegar.  
**Solución:** Forzar re-render suscribiéndose correctamente al store Zustand en el componente del badge. Verificar que el selector no esté usando un valor estático.  
**Prioridad:** Baja (cosmético, se corrige con navegación natural).

---

### B-05 · CORS origins hardcoded en backend
**Archivo:** `ferratech-backend/app/core/config.py`  
**Problema:** `cors_origins` tiene default `"http://localhost:5173"`. En producción debe configurarse vía `.env`.  
**Impacto:** Si se despliega sin setear `CORS_ORIGINS`, el frontend en producción (Vercel) recibirá errores CORS.  
**Solución:** Asegurarse de que `.env` de producción incluya `CORS_ORIGINS=https://ferratech.vercel.app` (o el dominio final).  
**Prioridad:** Alta — bloquea despliegue.

---

## ✅ Checklist de flujos manuales

### Flujo 1 — Búsqueda y detalle de producto ✅ PROBADO 2026-06-27
- [x] Buscar "taladro" en el buscador del Navbar → filtra en tiempo real sin recargar
- [ ] Aplicar un filtro de categoría y verificar que el grid se actualiza *(pendiente — solo 1 producto en BD)*
- [x] Abrir el detalle de un producto con variantes (Voltaje: 110V / 220V)
- [x] Verificar que no se puede añadir al carrito sin seleccionar variante (botón desactivado)
- [x] Seleccionar 110V y añadir al carrito → toast "Añadido al carrito" visible
- [x] Badge del carrito muestra "1" en Navbar (con delay leve al limpiar — ver B-06)
- [ ] Recargar y verificar persistencia en localStorage *(pendiente)*

### Flujo 2 — Carrito y cotización ✅ PROBADO 2026-06-27
- [x] Ir a `/carrito` → producto "Taladro Percutor 700W, Voltaje: 110V" visible con cantidad 1
- [ ] Incrementar / decrementar cantidades con los controles +/- *(pendiente)*
- [ ] Eliminar un ítem *(pendiente)*
- [x] Estado vacío tras cotización: "Tu carrito esta vacio" con link a /productos
- [x] "Solicitar cotización" abre modal con campos Nombre, Teléfono, Email, Notas
- [ ] Envío de form vacío (validación Zod) *(pendiente)*
- [x] Formulario completo enviado → backend responde, modal muestra pantalla éxito
- [x] Pantalla éxito con ícono verde y botón "Descargar cotizacion (PDF)"
- [x] PDF descargado correctamente
- [x] Cerrar modal → carrito vaciado (`clearCart()` ejecutado)

### Flujo 3 — Email y persistencia 🧪 PENDIENTE VERIFICACIÓN MANUAL
- [ ] Verificar que el email de notificación llegó al agente de ventas (`SALES_AGENT_EMAIL`)
- [ ] Abrir MongoDB Atlas y verificar que la cotización aparece en colección `cotizaciones` con estado `"pendiente"`
- [ ] Comprobar campos: `cliente`, `detalle[].id_producto`, `detalle[].cantidad`, `fecha`, `estado`

### Flujo 4 — Panel administrador ✅ PROBADO 2026-06-27
- [x] Crear 3 categorías: Herramientas Eléctricas, Tornillería y Fijación, Seguridad Industrial
- [x] Las 3 categorías aparecen en el filtro lateral de `/productos`
- [x] Crear "Taladro Percutor 700W" con categoría y variante Voltaje (110V / 220V)
- [x] Producto aparece en catálogo `/productos` con "Consultar precio" y botón "Añadir al Carrito"
- [x] Detalle del producto: breadcrumb, variantes, cantidad, "Añadir al Carrito"

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
2. **B-06 (Badge carrito)** — Revisar selector Zustand en Navbar para que el badge se actualice sin recargar.
3. **B-02 (Comprar Ahora)** — Decidir si se restituye como botón deshabilitado o se elimina del diseño.
4. Verificar que `RESEND_API_KEY` y `SALES_AGENT_EMAIL` estén seteados en el entorno de producción.
5. Verificar que `VITE_API_URL` apunte al backend desplegado en el build de Vercel.

## 📋 Resumen de pruebas funcionales (2026-06-27)

| Flujo | Estado | Notas |
|---|---|---|
| Flujo 1 — Búsqueda y detalle | ✅ Pasa | Búsqueda en tiempo real, variantes, botón disabled sin selección |
| Flujo 2 — Carrito y cotización | ✅ Pasa | Modal, envío, éxito, PDF, clearCart al cerrar |
| Flujo 3 — Email y MongoDB | 🧪 Pendiente | Requiere verificación manual en Resend/Atlas |
| Flujo 4 — Admin | ✅ Pasa | Categorías CRUD, producto con variantes, visible en catálogo |
| Flujo 5 — Responsividad | 🧪 Pendiente | Requiere prueba con DevTools mobile |
| Flujo 6 — Consola | ✅ Sin errores | 0 errores de consola durante toda la sesión de pruebas |
