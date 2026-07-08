import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * Envuelve rutas que requieren autenticación de admin.
 * Si el usuario no tiene un token válido, redirige a /login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
