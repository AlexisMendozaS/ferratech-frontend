export interface Atributo {
  nombre: string
  opciones: string[]
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio?: number | null
  imagen_principal: string | null
  categorias: string[]
  atributos: Atributo[]
  bajo_pedido: boolean
}

export interface ProductoCreate {
  nombre: string
  descripcion: string
  precio?: number | null
  imagen_principal?: string | null
  categorias?: string[]
  atributos?: Atributo[]
  bajo_pedido?: boolean
}

export type ProductoUpdate = Partial<ProductoCreate>

export interface PaginatedProductoResponse {
  total: number
  page: number
  limit: number
  productos: Producto[]
}
