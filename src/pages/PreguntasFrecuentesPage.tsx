import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────────────────────
// Contenido
// ─────────────────────────────────────────────────────────────────────────────

interface FAQ {
  pregunta: string
  respuesta: string
}

interface Seccion {
  titulo: string
  items: FAQ[]
}

const SECCIONES: Seccion[] = [
  {
    titulo: 'Pedidos y Cotizaciones',
    items: [
      {
        pregunta: '¿Cómo puedo solicitar una cotización?',
        respuesta:
          'Agrega los productos que te interesan al carrito y envía tu solicitud. Un agente de ventas se pondrá en contacto contigo para darte los detalles de disponibilidad y coordinar todo directamente.',
      },
      {
        pregunta: '¿Cuánto tiempo tarda en llegar mi cotización?',
        respuesta:
          'Nuestro equipo responde cotizaciones en un plazo máximo de 24 horas hábiles. Si necesitas atención urgente, puedes contactarnos directamente por WhatsApp.',
      },
      {
        pregunta: '¿La cotización tiene algún costo?',
        respuesta:
          'No. Solicitar una cotización es completamente gratuito y no te compromete a ninguna compra.',
      },
      {
        pregunta: '¿Puedo pedir productos que no están en el catálogo?',
        respuesta:
          'Sí. Contáctanos por WhatsApp o por correo y buscamos el producto que necesitas. Tenemos acceso a un amplio catálogo de proveedores.',
      },
      {
        pregunta: '¿Qué significa "Bajo pedido"?',
        respuesta:
          'Los productos marcados como "Bajo pedido" no están en existencia inmediata. Se consiguen bajo solicitud; el agente de ventas te confirma el tiempo de entrega estimado al momento de la cotización.',
      },
    ],
  },
  {
    titulo: 'Cuenta y Plataforma',
    items: [
      {
        pregunta: '¿Necesito crear una cuenta para comprar?',
        respuesta:
          'No es necesario. Puedes navegar el catálogo y solicitar cotizaciones sin registrarte. El área de administración está reservada para el equipo de FerraTech.',
      },
      {
        pregunta: '¿Mis datos están seguros?',
        respuesta:
          'Sí. Utilizamos conexiones cifradas (HTTPS) y no almacenamos información de pago en nuestros servidores. Consulta nuestra Política de Privacidad para más detalles.',
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Accordion item
// ─────────────────────────────────────────────────────────────────────────────

function AccordionItem({ faq, isOpen, onToggle }: {
  faq: FAQ
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        <span>{faq.pregunta}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{faq.respuesta}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PreguntasFrecuentesPage() {
  // openKey = "seccionIndex-itemIndex"
  const [openKey, setOpenKey] = useState<string | null>(null)

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key))

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-14 text-center text-primary-foreground">
        <h1 className="text-4xl font-black">Preguntas Frecuentes</h1>
        <p className="mt-3 text-sm text-primary-foreground/70 max-w-md mx-auto">
          Encuentra respuestas a las dudas más comunes sobre el catálogo, cotizaciones y la plataforma.
        </p>
      </section>

      {/* Contenido */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-8">
          {SECCIONES.map((seccion, si) => (
            <section key={si}>
              <h2 className="mb-4 text-base font-bold text-foreground border-l-4 border-primary pl-3">
                {seccion.titulo}
              </h2>
              <div className="rounded-xl border bg-card px-5">
                {seccion.items.map((faq, fi) => {
                  const key = `${si}-${fi}`
                  return (
                    <AccordionItem
                      key={key}
                      faq={faq}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA contacto */}
        <div className="mt-12 rounded-xl bg-muted/50 border p-6 text-center">
          <MessageCircle className="mx-auto mb-3 size-8 text-primary" />
          <h3 className="font-semibold text-foreground">¿No encontraste tu respuesta?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Contáctanos directamente y con gusto te ayudamos.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <a
                href="https://wa.me/7717947345"
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/productos">Ver catálogo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
