import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ProductosPage from '@/pages/ProductosPage'
import ProductoDetallePage from '@/pages/ProductoDetallePage'
import CarritoPage from '@/pages/CarritoPage'
import ProductoFormPage from '@/pages/admin/ProductoFormPage'
import ProductosAdminPage from '@/pages/admin/ProductosAdminPage'
import CategoriasAdminPage from '@/pages/admin/CategoriasAdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/producto/:id" element={<ProductoDetallePage />} />
        <Route path="/carrito" element={<CarritoPage />} />

        {/* Admin */}
        <Route path="/admin/categorias" element={<CategoriasAdminPage />} />
        <Route path="/admin/productos" element={<ProductosAdminPage />} />
        <Route path="/admin/productos/nuevo" element={<ProductoFormPage />} />
        <Route path="/admin/productos/:id/editar" element={<ProductoFormPage />} />
      </Routes>
    </BrowserRouter>
  )
}
