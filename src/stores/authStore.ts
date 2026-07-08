import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,

      setToken: (token) => set({ token }),

      clearToken: () => set({ token: null }),

      /** Verifica que haya un token y que no esté expirado */
      isAuthenticated: () => {
        const { token } = get()
        if (!token) return false
        try {
          // Decodificar el payload del JWT (sin verificar firma en el cliente)
          const payload = JSON.parse(atob(token.split('.')[1]))
          const expMs = payload.exp * 1000
          return Date.now() < expMs
        } catch {
          return false
        }
      },
    }),
    { name: 'ferratech-auth' }
  )
)
