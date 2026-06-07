# ferratech-frontend

Frontend del e-commerce FerraTech. React 19 + TypeScript + Vite.

## Inicio rapido

**Requisitos:** Node.js 20+ y pnpm 10+

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:5173` en el navegador.

## Comandos

```bash
pnpm dev      # servidor de desarrollo con HMR
pnpm build    # build de produccion (type-check + bundle)
pnpm preview  # preview del build
pnpm lint     # lint
```

## Variables de entorno

Crea un `.env.local` en la raiz (no se commitea):

```env
VITE_API_URL=http://localhost:8000/api
```

Ver [docs/setup.md](docs/setup.md) para la guia completa del proyecto.
