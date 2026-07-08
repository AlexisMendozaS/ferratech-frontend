import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import ProductosPage from '@/pages/ProductosPage'
import ProductoDetallePage from '@/pages/ProductoDetallePage'
import CarritoPage from '@/pages/CarritoPage'
import CategoriasPage from '@/pages/CategoriasPage'
import CategoriaPage from '@/pages/CategoriaPage'
import ProductoFormPage from '@/pages/admin/ProductoFormPage'
import ProductosAdminPage from '@/pages/admin/ProductosAdminPage'
import CategoriasAdminPage from '@/pages/admin/CategoriasAdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/producto/:id" element={<ProductoDetallePage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/categorias/:id" element={<CategoriaPage />} />
        </Route>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas admin — protegidas con JWT */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="productos" element={<ProductosAdminPage />} />
            <Route path="productos/nuevo" element={<ProductoFormPage />} />
            <Route path="productos/:id/editar" element={<ProductoFormPage />} />
            <Route path="categorias" element={<CategoriasAdminPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
