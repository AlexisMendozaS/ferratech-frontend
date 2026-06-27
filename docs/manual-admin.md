# Manual de Administración del Catálogo — FerraTech

Este manual explica cómo gestionar el catálogo de productos desde el panel de administración.

> **Acceso:** El panel está en `/admin`. En la primera entrega no requiere contraseña (autenticación pendiente).

---

## Secciones del Panel

| Ruta | Descripción |
|---|---|
| `/admin/categorias` | Crear, editar y eliminar categorías |
| `/admin/productos` | Listar y eliminar productos |
| `/admin/productos/nuevo` | Crear un producto nuevo |
| `/admin/productos/{id}/editar` | Editar un producto existente |

---

## Gestión de Categorías

### Crear una categoría

1. Ir a `/admin/categorias`
2. En el formulario superior, escribir el nombre de la categoría (ej. `Herramientas eléctricas`)
3. Hacer clic en **Crear**
4. La categoría aparecerá en la lista y estará disponible al crear productos

### Editar una categoría

1. En la lista, hacer clic en el ícono de edición junto a la categoría
2. Modificar el nombre en el campo que aparece inline
3. Confirmar con **Guardar** o cancelar con **✕**

### Eliminar una categoría

1. Hacer clic en el ícono de papelera junto a la categoría
2. Confirmar la acción en el diálogo de confirmación

> ⚠️ Eliminar una categoría **no elimina** los productos que la tienen asignada. Los productos seguirán existiendo pero sin categoría hasta que se les asigne una nueva.

---

## Gestión de Productos

### Crear un producto

1. Ir a `/admin/productos` y hacer clic en **Nuevo producto**, o navegar directamente a `/admin/productos/nuevo`

2. Completar los campos del formulario:

| Campo | Obligatorio | Descripción |
|---|---|---|
| **Nombre** | Sí | Nombre del producto (mínimo 2 caracteres) |
| **Descripción** | No | Descripción detallada del producto |
| **Precio** | No | Precio unitario en MXN. Si se deja vacío aparece "Precio a consultar" |
| **Categorías** | No | Una o más categorías del catálogo |
| **Bajo pedido** | No | Activa la etiqueta "Bajo pedido" en el producto |

3. Hacer clic en **Crear producto**

El sistema guardará el producto en MongoDB y lo redirigirá al listado.

### Añadir variantes

Las variantes permiten que un producto tenga opciones seleccionables (tallas, colores, materiales, etc.).

1. En el formulario de creación o edición, ir a la sección **Variantes/Atributos**
2. Hacer clic en **Añadir atributo**
3. Escribir el nombre del atributo (ej. `Talla`, `Color`, `Material`)
4. Añadir las opciones del atributo separadas (ej. `Chico`, `Mediano`, `Grande`)
5. Repetir para cada atributo que necesite el producto

**Ejemplo:** Para un guante de trabajo:
- Atributo: `Talla` → Opciones: `Chico`, `Mediano`, `Grande`, `XL`
- Atributo: `Material` → Opciones: `Cuero`, `Sintético`

El cliente deberá seleccionar todas las variantes antes de poder añadir el producto al carrito.

### Subir imagen principal

Después de crear el producto:

1. Ir a `/admin/productos` y hacer clic en el nombre del producto para editarlo
2. En la sección **Imagen principal**, hacer clic en el botón de carga
3. Seleccionar una imagen desde tu computadora (formatos: JPG, PNG, WebP)
4. Esperar a que suba. La imagen se almacenará en Vercel Blob Storage
5. La URL de la imagen se guarda automáticamente en el producto

> La imagen aparecerá en la tarjeta del catálogo y en la galería de la página de detalle.

### Editar un producto

1. En `/admin/productos`, hacer clic en **Editar** junto al producto
2. Modificar los campos necesarios
3. Hacer clic en **Guardar cambios**

### Eliminar un producto

1. En `/admin/productos`, hacer clic en el ícono de papelera
2. Confirmar en el diálogo de eliminación

> Los productos eliminados desaparecen inmediatamente del catálogo. No hay papelera de reciclaje.

---

## Verificar que un producto aparece en el catálogo

Después de crear o editar un producto:

1. Abrir `/productos` en una pestaña nueva
2. Buscar el producto por nombre usando el buscador del Navbar
3. Si tiene categoría asignada, verificar que aparece al filtrar por esa categoría
4. Abrir el detalle del producto y confirmar que la información es correcta

---

## Revisar cotizaciones recibidas

Las cotizaciones enviadas por clientes se guardan en MongoDB Atlas:

1. Acceder a [MongoDB Atlas](https://cloud.mongodb.com)
2. Ir a **Browse Collections** → base de datos `ferratech` → colección `cotizaciones`
3. Cada documento tiene esta estructura:

```json
{
  "_id": "ObjectId",
  "fecha": "2026-06-27T18:00:00Z",
  "estado": "pendiente",
  "cliente": {
    "nombre": "Juan Pérez",
    "telefono": "+52 55 1234 5678",
    "email": "juan@ejemplo.com",
    "notas": "Necesito entrega urgente"
  },
  "detalle": [
    {
      "id_producto": "ObjectId del producto",
      "nombre_producto": "Taladro percutor 700W",
      "variante_seleccionada": "Voltaje: 110V",
      "cantidad": 2
    }
  ]
}
```

4. Para marcar una cotización como atendida, se puede actualizar el campo `estado` a `"atendida"` directamente desde Atlas (interfaz gráfica de MongoDB).

> En la segunda entrega se añadirá una vista de cotizaciones en el panel de administración.

---

## Preguntas Frecuentes

**¿Por qué el producto no aparece en el catálogo después de crearlo?**
Verifica que la URL del backend (`VITE_API_URL`) esté correcta en el entorno. Si es local, el backend debe estar corriendo en `http://localhost:8000`.

**¿Puedo tener un producto sin categoría?**
Sí. Aparecerá en el catálogo general pero no en los filtros por categoría.

**¿Qué pasa si dejo el precio vacío?**
El producto muestra "Precio a consultar" en lugar de un valor numérico.

**¿Los cambios en el catálogo se ven inmediatamente?**
Sí. Cada vez que el cliente recarga `/productos` se hace una petición fresca a la API.

**¿Cuántas imágenes puede tener un producto?**
En la primera entrega sólo se soporta una imagen principal. Las miniaturas adicionales en la galería de detalle son marcadores de posición para entregas futuras.
