/** Preguntas frecuentes del sitio público (también van como datos estructurados FAQPage). */
export interface Pregunta {
  pregunta: string
  respuesta: string
}

export interface SeccionPreguntas {
  titulo: string
  items: Pregunta[]
}

export const PREGUNTAS: SeccionPreguntas[] = [
  {
    titulo: 'Pedidos y Cotizaciones',
    items: [
      {
        pregunta: '¿Cómo puedo solicitar una cotización?',
        respuesta:
          'Agrega a tu cotización los productos y medidas que necesitas y envía tu solicitud; no tiene costo. Un agente de ventas se pondrá en contacto contigo para darte los detalles de disponibilidad y coordinar todo directamente.',
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
    titulo: 'Entregas',
    items: [
      {
        pregunta: '¿En qué estados entregan?',
        respuesta:
          'Atendemos principalmente Hidalgo, Tlaxcala, Puebla, Veracruz, Ciudad de México y Estado de México, y cotizamos para el resto del país. Al enviar tu cotización indica el estado de la obra.',
      },
      {
        pregunta: '¿Cuánto tarda la entrega y cuánto cuesta?',
        respuesta:
          'Las entregas y sus tiempos se acuerdan con el vendedor según la disponibilidad y la cantidad de material. Te lo confirmamos junto con tu cotización, sin costo.',
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
