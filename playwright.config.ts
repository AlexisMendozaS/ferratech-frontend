/**
 * Pruebas de punta a punta (E2E) con Playwright — DEC-003, INI-010.
 *
 * Levanta su propio backend (puerto 8001) y frontend (puerto 5174), distintos de los de
 * desarrollo, contra una base de MongoDB SEPARADA (`ferratech_e2e`).
 *
 *   pnpm test:e2e                       usa MONGO_URI del .env del backend
 *   E2E_MONGO_URI=mongodb://... pnpm test:e2e   otra instancia (por ejemplo, un Mongo local en Docker)
 *
 * Los navegadores se instalan una vez con `pnpm exec playwright install chromium`.
 */
import { defineConfig, devices } from '@playwright/test'

const BACKEND_PORT = 8001
const FRONTEND_PORT = 5174
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`
const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`
const PYTHON =
  process.platform === 'win32' ? '.venv\\Scripts\\python.exe' : '.venv/bin/python'

const backendEnv: Record<string, string> = {
  MONGO_DB_NAME: 'ferratech_e2e',
  CORS_ORIGINS: FRONTEND_URL,
  PYTHONDONTWRITEBYTECODE: '1',
}
if (process.env.E2E_MONGO_URI) backendEnv.MONGO_URI = process.env.E2E_MONGO_URI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'es-MX',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: `${PYTHON} -m uvicorn main:app --host 127.0.0.1 --port ${BACKEND_PORT}`,
      cwd: '../ferratech-backend',
      url: `${BACKEND_URL}/health`,
      env: backendEnv,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `pnpm exec vite --host 127.0.0.1 --port ${FRONTEND_PORT} --strictPort`,
      url: FRONTEND_URL,
      env: { VITE_API_URL: BACKEND_URL },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
