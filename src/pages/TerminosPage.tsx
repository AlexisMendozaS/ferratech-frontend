import { Seo } from '@/components/seo/Seo'

const LAST_UPDATED = '7 de julio de 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-bold text-foreground border-l-4 border-primary pl-3">
        {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function TerminosPage() {
  return (
    <div>
      <Seo
        title="Términos de Uso"
        description="Términos de uso de FerraTech. Conoce las condiciones de uso del catálogo, cotizaciones y la plataforma."
        noindex
      />
      {/* Hero */}
      <section className="bg-primary py-12 text-center text-primary-foreground">
        <h1 className="text-3xl font-black">Términos de Uso</h1>
        <p className="mt-2 text-sm text-primary-foreground/60">
          Última actualización: {LAST_UPDATED}
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="rounded-xl border bg-card px-6 sm:px-8 py-8">

          <Section title="1. Naturaleza del sitio">
            <p>
              FerraTech es un <strong>catálogo digital</strong> de herramientas y materiales de
              construcción. El Sitio permite a los visitantes consultar productos, precios
              referenciales y enviar solicitudes de cotización. <strong>No es una tienda en línea
              con pago electrónico integrado</strong>: cada transacción se coordina directamente
              con el agente de ventas.
            </p>
          </Section>

          <Section title="2. Precios y disponibilidad">
            <p>
              Los precios mostrados en el Sitio son <strong>referenciales</strong> y están sujetos
              a cambio sin previo aviso, dependiendo de disponibilidad, volumen y condiciones del
              mercado. El precio final se confirma al momento de la cotización personalizada.
            </p>
            <p>
              FerraTech no garantiza la disponibilidad inmediata de todos los productos del
              catálogo. Los artículos marcados como "Bajo pedido" se consiguen bajo solicitud
              expresa.
            </p>
          </Section>

          <Section title="3. Solicitudes de cotización">
            <p>
              Al enviar una solicitud de cotización o formulario de contacto a través del Sitio,
              usted autoriza expresamente a FerraTech a contactarle mediante los datos
              proporcionados (teléfono, correo electrónico) para dar seguimiento a su solicitud.
            </p>
            <p>
              El envío de una cotización no representa una compra confirmada ni un compromiso de
              venta por parte de FerraTech.
            </p>
          </Section>

          <Section title="4. Contenido del sitio">
            <p>
              Las imágenes, descripciones y especificaciones de los productos son
              ilustrativas. FerraTech hace su mejor esfuerzo por mantener la información
              actualizada, pero no garantiza que sea exacta, completa o libre de errores en todo
              momento. El contenido puede modificarse sin previo aviso.
            </p>
          </Section>

          <Section title="5. Uso aceptable">
            <p>Queda prohibido utilizar el Sitio para:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Enviar información falsa o fraudulenta en formularios de contacto.</li>
              <li>Intentar acceder sin autorización a secciones restringidas del sistema.</li>
              <li>Realizar scraping automatizado del catálogo sin autorización escrita.</li>
              <li>Cualquier actividad que viole las leyes aplicables en México.</li>
            </ul>
          </Section>

          <Section title="6. Limitación de responsabilidad">
            <p>
              FerraTech no se hace responsable por daños directos o indirectos derivados del uso
              del Sitio, errores tipográficos en precios o descripciones, ni por interrupciones
              del servicio. El uso del Sitio es bajo la propia responsabilidad del usuario.
            </p>
          </Section>

          <Section title="7. Privacidad">
            <p>
              El tratamiento de sus datos personales se rige por nuestro{' '}
              <a href="/privacidad" className="text-primary hover:underline">
                Aviso de Privacidad
              </a>
              , el cual forma parte integral de estos Términos.
            </p>
          </Section>

          <Section title="8. Modificaciones">
            <p>
              Estos Términos pueden actualizarse en cualquier momento. La versión vigente siempre
              estará disponible en esta página con la fecha de última modificación. El uso
              continuado del Sitio implica la aceptación de los Términos vigentes.
            </p>
          </Section>

          <Section title="9. Jurisdicción">
            <p>
              Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
              controversia derivada de su interpretación o cumplimiento se someterá a la
              jurisdicción de los tribunales competentes de México.
            </p>
          </Section>

          <p className="mt-6 text-xs text-muted-foreground/60 text-center">
            Al utilizar este Sitio, usted acepta haber leído y comprendido estos Términos de Uso.
          </p>
        </div>
      </div>
    </div>
  )
}
