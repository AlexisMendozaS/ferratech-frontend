import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Wrench } from 'lucide-react'
import { toast } from 'sonner'

import { loginWithGoogle } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, isAuthenticated } = useAuthStore()

  // Si ya está autenticado, ir directo al admin
  useEffect(() => {
    if (isAuthenticated()) navigate('/admin/productos', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      toast.error('No se recibió token de Google')
      return
    }
    try {
      const jwt = await loginWithGoogle(idToken)
      setToken(jwt)
      toast.success('Sesión iniciada')
      navigate('/admin/productos', { replace: true })
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      toast.error(msg)
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary">
              <Wrench className="size-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FerraTech</span>
          </div>

          <h1 className="mb-1 text-lg font-semibold text-foreground">
            Panel de administración
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Inicia sesión con tu cuenta de Google para continuar
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => toast.error('Error al autenticar con Google')}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              locale="es"
            />
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Solo el administrador autorizado puede acceder.
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
