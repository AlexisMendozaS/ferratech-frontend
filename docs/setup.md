# FerraTech Frontend — Setup

## Requisitos

| Herramienta | Version minima |
|-------------|----------------|
| Node.js     | 20.x           |
| pnpm        | 10.x           |

Instalar pnpm si no lo tienes:

```bash
npm install -g pnpm
```

---

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/AlexisMendozaS/ferratech-frontend.git
cd ferratech-frontend

# Instalar dependencias
pnpm install
```

---

## Comandos disponibles

```bash
# Servidor de desarrollo con HMR
pnpm dev

# Build para produccion (type-check + bundle)
pnpm build

# Preview del build de produccion
pnpm preview

# Linting
pnpm lint
```

El servidor de desarrollo corre en `http://localhost:5173` por defecto.

---

## Estructura del proyecto

```
ferratech-frontend/
├── public/             # Archivos estaticos servidos directamente (favicon, etc.)
├── src/
│   ├── assets/         # Imagenes, fuentes, SVGs importados en componentes
│   ├── components/     # Componentes reutilizables (UI generico)
│   ├── hooks/          # Custom hooks de React
│   ├── pages/          # Componentes de pagina (uno por ruta)
│   ├── services/       # Llamadas a la API (fetch/axios wrappers)
│   ├── types/          # Tipos e interfaces TypeScript compartidos
│   ├── utils/          # Funciones helper puras
│   ├── App.tsx         # Componente raiz y configuracion de rutas
│   ├── index.css       # Reset CSS y variables globales
│   └── main.tsx        # Entry point — monta React en el DOM
├── index.html          # HTML template de Vite
├── vite.config.ts      # Configuracion de Vite
├── tsconfig.json       # Configuracion base de TypeScript
└── package.json
```

---

## Stack tecnico

- **React 19** con React Compiler habilitado
- **TypeScript 6**
- **Vite 8** — bundler y dev server
- **pnpm** — gestor de paquetes

---

## Variables de entorno

Crea un archivo `.env.local` en la raiz del proyecto (no se commitea):

```env
VITE_API_URL=http://localhost:8000/api
```

> Todas las variables expuestas al cliente deben tener el prefijo `VITE_`.

---

## Convenciones

- Un archivo por componente, nombrado en **PascalCase**: `ProductCard.tsx`
- Las carpetas dentro de `components/` agrupan por dominio: `components/cart/`, `components/product/`
- Los hooks van con prefijo `use`: `useCart.ts`, `useProducts.ts`
- Los servicios reflejan el recurso de la API: `products.service.ts`, `auth.service.ts`
