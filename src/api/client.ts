import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inyectar el JWT en cada request si está disponible en el store
client.interceptors.request.use((config) => {
  // Leemos directamente del localStorage para evitar ciclos de importación con Zustand
  try {
    const raw = localStorage.getItem('ferratech-auth')
    if (raw) {
      const { state } = JSON.parse(raw) as { state: { token: string | null } }
      if (state?.token) {
        config.headers['Authorization'] = `Bearer ${state.token}`
      }
    }
  } catch {
    // Si falla el parseo, continuar sin token
  }
  return config
})

export default client
