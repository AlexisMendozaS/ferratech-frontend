import { lazy, Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCarritoStore } from '@/store/carritoStore'
import { buildPayload, enviarCotizacion, type ClienteData } from '@/services/cotizaciones'
import type { CartItem } from '@/store/carritoStore'
import { ESTADOS_MX } from '@/lib/estados'

const DescargaPDF = lazy(() => import('@/components/cotizacion/DescargaPDF'))

const schema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre completo'),
  telefono: z.string().min(7, 'Ingresa un teléfono válido'),
  email: z.string().email('Ingresa un correo válido'),
  notas: z.string().optional(),
  estado_republica: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/* ── Nombre de archivo: cotizacion-YYYY-MM-DD-{nombre}.pdf ── */
function buildFilename(nombre: string): string {
  const fecha = new Date().toISOString().slice(0, 10)
  const slug = nombre
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return `cotizacion-${fecha}-${slug}.pdf`
}

/* ── Pantalla de éxito con descarga PDF ─────────────────── */
function SuccessScreen({
  cliente,
  items,
  onClose,
}: {
  cliente: ClienteData
  items: CartItem[]
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <CheckCircle className="size-12 text-green-500" />
      <div>
        <p className="text-base font-semibold text-foreground">
          ¡Cotizacion enviada!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Un agente de ventas se pondra en contacto contigo pronto.
        </p>
      </div>

      {/* La librería de PDF pesa más de 1 MB: se descarga solo al llegar a esta pantalla. */}
      <Suspense fallback={<Button variant="outline" className="gap-2" disabled><Loader2 className="size-4 animate-spin" />Preparando PDF...</Button>}>
        <DescargaPDF cliente={cliente} items={items} fileName={buildFilename(cliente.nombre)} />
      </Suspense>

      <Button onClick={onClose} className="w-full">
        Cerrar
      </Button>
    </div>
  )
}

/* ── Modal principal ─────────────────────────────────────── */
export function ModalCotizacion({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [clienteData, setClienteData] = useState<ClienteData | null>(null)
  const [itemsSnapshot, setItemsSnapshot] = useState<CartItem[]>([])

  const items = useCarritoStore((s) => s.items)
  const clearCart = useCarritoStore((s) => s.clearCart)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', telefono: '', email: '', notas: '', estado_republica: '' },
  })

  const handleClose = () => {
    if (loading) return
    if (submitted) {
      clearCart()
      setSubmitted(false)
      setClienteData(null)
      setItemsSnapshot([])
      form.reset()
    }
    onOpenChange(false)
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const cliente: ClienteData = {
        nombre: values.nombre,
        telefono: values.telefono,
        email: values.email,
        notas: values.notas || undefined,
        estado_republica: values.estado_republica || undefined,
      }
      const snapshot = [...items]
      await enviarCotizacion(buildPayload(cliente, snapshot))

      setClienteData(cliente)
      setItemsSnapshot(snapshot)
      setSubmitted(true)
      toast.success('Cotizacion enviada correctamente.')
      onSuccess?.()
    } catch {
      toast.error('No se pudo enviar la cotizacion. Intentalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted && clienteData ? (
          <SuccessScreen
            cliente={clienteData}
            items={itemsSnapshot}
            onClose={handleClose}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar cotizacion</DialogTitle>
              <DialogDescription>
                Completa tus datos y un agente de ventas se pondra en contacto contigo.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Perez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono *</FormLabel>
                      <FormControl>
                        <Input placeholder="+52 555 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electronico *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado_republica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿En qué estado es la obra?</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Prefiero no decirlo</option>
                          {ESTADOS_MX.map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Especifica cantidades, urgencia, entrega, etc."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Enviar solicitud
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
