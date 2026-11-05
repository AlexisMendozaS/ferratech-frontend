/**
 * Panel de administración: una aplicación React que solo corre en el navegador. Astro la monta
 * en /login y /admin/* (`client:only`), así que su código nunca viaja en las páginas públicas.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import LoginPage from '@/vistas/LoginPage'
import ProductoFormPage from '@/vistas/admin/ProductoFormPage'
import ProductosAdminPage from '@/vistas/admin/ProductosAdminPage'
import CategoriasAdminPage from '@/vistas/admin/CategoriasAdminPage'
import AdminDashboardPage from '@/vistas/admin/AdminDashboardPage'
import AdminCotizacionesPage from '@/vistas/admin/AdminCotizacionesPage'
import AdminLeadsPage from '@/vistas/admin/AdminLeadsPage'

export default function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="cotizaciones" element={<AdminCotizacionesPage />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="productos" element={<ProductosAdminPage />} />
            <Route path="productos/nuevo" element={<ProductoFormPage />} />
            <Route path="productos/:id/editar" element={<ProductoFormPage />} />
            <Route path="categorias" element={<CategoriasAdminPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
