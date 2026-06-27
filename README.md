# FerraTech — Catálogo y Cotizaciones Online

Aplicación web tipo e-commerce para una ferretería. Permite a los clientes explorar el catálogo de productos, armar un carrito y solicitar una cotización por correo. Incluye un panel de administración para gestionar categorías y productos.

> **Primera entrega:** Catálogo + Carrito + Solicitud de cotización. Sin pasarela de pago.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Estilos | Tailwind CSS v4 + Shadcn/ui (Radix UI) |
| Estado | Zustand (persistido en localStorage) |
| Formularios | React Hook Form + Zod |
| HTTP | Axios |
| PDF | @react-pdf/renderer |
| Toasts | Sonner |
| Backend | Python 3.12 + FastAPI |
| Base de datos | MongoDB Atlas (Motor async) |
| Emails | Resend |
| Deploy | Vercel (frontend) + Vercel Serverless (backend) |

---

## Estructura del Proyecto

```
Proyecto-Tienda-Ferreteria/
├── ferratech-frontend/     # Aplicación React
│   ├── src/
│   │   ├── api/            # Cliente Axios (client.ts)
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── cotizacion/ # ModalCotizacion, CotizacionPDF
│   │   │   ├── layout/     # Navbar
│   │   │   ├── productos/  # ProductCard
│   │   │   └── ui/         # Shadcn components
│   │   ├── pages/          # Páginas por ruta
│   │   │   └── admin/      # Panel de administración
│   │   ├── services/       # Llamadas a la API
│   │   ├── store/          # Zustand stores
│   │   └── types/          # Tipos TypeScript
│   └── docs/               # Documentación adicional
└── ferratech-backend/      # API FastAPI
    ├── app/
    │   ├── core/           # Config, DB, utilidades
    │   ├── models/         # Modelos MongoDB (Pydantic)
    │   ├── routers/        # Endpoints HTTP
    │   ├── schemas/        # Schemas request/response
    │   └── services/       # Lógica de negocio
    └── docs/               # Documentación adicional
```

---

## Requisitos Previos

| Herramienta | Versión mínima | Instalación |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| Python | 3.12 | https://www.python.org |
| Git | 2.x | https://git-scm.com |

Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) y [Resend](https://resend.com) para el email.

---

## Instalación Local

### 1. Clonar los repositorios

```bash
git clone https://github.com/AlexisMendozaS/ferratech-frontend.git
git clone https://github.com/AlexisMendozaS/ferratech-backend.git
```

### 2. Backend

```bash
cd ferratech-backend

# Crear y activar entorno virtual
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno
copy .env.example .env   # Windows
# Editar .env con tus valores (ver tabla más abajo)
```

### 3. Frontend

```bash
cd ferratech-frontend

# Instalar dependencias
pnpm install

# Variables de entorno
copy .env.example .env.local   # Windows
# Editar .env.local con tus valores
```

---

## Variables de Entorno

### Backend — `ferratech-backend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `MONGO_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://user:pw@cluster.mongodb.net/` |
| `MONGO_DB_NAME` | Nombre de la base de datos | `ferratech` |
| `RESEND_API_KEY` | API key de Resend para emails | `re_xxxxxxxxxxxx` |
| `SALES_AGENT_EMAIL` | Email del agente que recibe cotizaciones | `agente@ferratech.com` |
| `CORS_ORIGINS` | Orígenes permitidos (separados por coma) | `http://localhost:5173` |
| `APP_ENV` | Entorno (`development` / `production`) | `development` |

### Frontend — `ferratech-frontend/.env.local`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` |

---

## Comandos

### Backend

```bash
cd ferratech-backend

# Servidor de desarrollo (hot reload)
fastapi dev main.py
# → http://localhost:8000
# → Swagger: http://localhost:8000/docs

# Tests
pytest

# Poblar la base de datos con datos de prueba
python scripts/seed.py
```

### Frontend

```bash
cd ferratech-frontend

# Servidor de desarrollo
pnpm dev
# → http://localhost:5173

# Build de producción
pnpm build

# Vista previa del build
pnpm preview

# Lint
pnpm lint
```

---

## Flujo de la Aplicación

```
Cliente visita /productos
  → Filtra por categoría / busca por texto
  → Abre detalle del producto
  → Selecciona variantes y añade al carrito (Zustand + localStorage)
  → Va a /carrito
  → Clic en "Solicitar cotización"
  → Rellena sus datos en el modal
  → Backend guarda la cotización en MongoDB
  → Backend envía email al agente vía Resend
  → Cliente descarga PDF de la cotización
```

---

## Endpoints del Backend

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Health check básico |
| `GET` | `/health` | Health check |
| `GET` | `/categorias/` | Listar categorías |
| `POST` | `/categorias/` | Crear categoría |
| `PUT` | `/categorias/{id}` | Actualizar categoría |
| `DELETE` | `/categorias/{id}` | Eliminar categoría |
| `GET` | `/productos/` | Listar productos |
| `GET` | `/productos/buscar` | Buscar/filtrar con paginación |
| `GET` | `/productos/{id}` | Obtener producto por ID |
| `POST` | `/productos/` | Crear producto |
| `PUT` | `/productos/{id}` | Actualizar producto |
| `DELETE` | `/productos/{id}` | Eliminar producto |
| `POST` | `/productos/{id}/imagen` | Subir imagen principal |
| `GET` | `/cotizaciones/` | Listar cotizaciones |
| `POST` | `/cotizaciones/` | Crear cotización |
| `GET` | `/cotizaciones/{id}` | Obtener cotización por ID |

---

## Decisiones de Arquitectura Relevantes

- **Sin autenticación en primera entrega.** El panel de administración (`/admin/*`) no está protegido por ruta. Esto se abordará en la segunda entrega.
- **Carrito en localStorage.** Zustand con middleware `persist` usa la clave `ferratech-carrito`. No requiere sesión de usuario.
- **Email asíncrono.** El backend dispara la notificación al agente con `asyncio.create_task()` después de guardar la cotización, para no bloquear la respuesta HTTP.
- **Precios a consultar.** El campo `precio_unitario` existe en el modelo pero es `null` en esta entrega. El PDF no muestra precios.

---

## Despliegue en Vercel

El frontend se despliega automáticamente desde GitHub. Variable de entorno requerida en Vercel:

```
VITE_API_URL=https://ferratech-api.vercel.app
```

Consulta `ferratech-backend/docs/setup.md` para instrucciones del backend.

> ⚠️ Configura `CORS_ORIGINS` en el backend con el dominio del frontend antes de desplegar.
