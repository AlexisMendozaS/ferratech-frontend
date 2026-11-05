import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id_producto: string
  nombre: string
  imagen: string | null
  variante_seleccionada: string | null
  /** Opcionales: los carritos guardados antes del modelo con variantes no los traen. */
  sku?: string | null
  unidad_venta?: string | null
  cantidad: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cantidad'> & { cantidad?: number }) => void
  removeItem: (id_producto: string, variante_seleccionada: string | null) => void
  updateQuantity: (id_producto: string, variante_seleccionada: string | null, cantidad: number) => void
  clearCart: () => void
  totalItems: () => number
}

/** Clave de comparación única por producto + variante */
const itemKey = (id: string, variante: string | null) => `${id}::${variante ?? ''}`

export const useCarritoStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ id_producto, nombre, imagen, variante_seleccionada, sku = null, unidad_venta = null, cantidad = 1 }) => {
        const key = itemKey(id_producto, variante_seleccionada)
        set((state) => {
          const existing = state.items.find(
            (i) => itemKey(i.id_producto, i.variante_seleccionada) === key
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.id_producto, i.variante_seleccionada) === key
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i
              ),
            }
          }
          return {
            items: [...state.items, { id_producto, nombre, imagen, variante_seleccionada, sku, unidad_venta, cantidad }],
          }
        })
      },

      removeItem: (id_producto, variante_seleccionada) => {
        const key = itemKey(id_producto, variante_seleccionada)
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.id_producto, i.variante_seleccionada) !== key
          ),
        }))
      },

      updateQuantity: (id_producto, variante_seleccionada, cantidad) => {
        if (cantidad < 1) return
        const key = itemKey(id_producto, variante_seleccionada)
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.id_producto, i.variante_seleccionada) === key ? { ...i, cantidad } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    {
      name: 'ferratech-carrito',
      // Solo persiste los items, no las funciones
      partialize: (state) => ({ items: state.items }),
    }
  )
)
