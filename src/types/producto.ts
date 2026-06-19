export interface Atributo {
  nombre: string
  opciones: string[]
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  imagen_principal: string | null
  categorias: string[]
  atributos: Atributo[]
  bajo_pedido: boolean
}

export interface ProductoCreate {
  nombre: string
  descripcion: string
  imagen_principal?: string | null
  categorias?: string[]
  atributos?: Atributo[]
  bajo_pedido?: boolean
}

export type ProductoUpdate = Partial<ProductoCreate>
