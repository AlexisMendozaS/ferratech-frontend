import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ProductosPage from '@/pages/ProductosPage'
import ProductoDetallePage from '@/pages/ProductoDetallePage'
import CarritoPage from '@/pages/CarritoPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/producto/:id" element={<ProductoDetallePage />} />
        <Route path="/carrito" element={<CarritoPage />} />
      </Routes>
    </BrowserRouter>
  )
}
