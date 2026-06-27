import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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

const schema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre completo'),
  telefono: z.string().min(7, 'Ingresa un teléfono válido'),
  email: z.string().email('Ingresa un correo válido'),
  notas: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ModalCotizacion({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const items = useCarritoStore((s) => s.items)
  const clearCart = useCarritoStore((s) => s.clearCart)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', telefono: '', email: '', notas: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const cliente: ClienteData = {
        nombre: values.nombre,
        telefono: values.telefono,
        email: values.email,
        notas: values.notas || undefined,
      }
      await enviarCotizacion(buildPayload(cliente, items))
      toast.success('Cotizacion enviada. El agente se pondra en contacto contigo.')
      clearCart()
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('No se pudo enviar la cotizacion. Intentalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
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
                onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  )
}
