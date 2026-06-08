import { useParams } from 'react-router-dom'

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  return <div>Producto {id}</div>
}
