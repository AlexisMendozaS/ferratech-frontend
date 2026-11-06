import { DOMINIO_SITIO } from '@/lib/sitio'
const AGENT_EMAIL = 'armandomendoza988@gmail.com'
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

export default function AvisoPrivacidadPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-12 text-center text-primary-foreground">
        <h1 className="text-3xl font-black">Aviso de Privacidad</h1>
        <p className="mt-2 text-sm text-primary-foreground/60">
          Última actualización: {LAST_UPDATED}
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="rounded-xl border bg-card px-6 sm:px-8 py-8">

          <Section title="I. Identidad y domicilio del Responsable">
            <p>
              Yo, agente de ventas de <strong>FerraTech</strong>, con correo electrónico{' '}
              <a href={`mailto:${AGENT_EMAIL}`} className="text-primary hover:underline">
                {AGENT_EMAIL}
              </a>
              , soy el responsable del tratamiento de los datos personales que usted nos proporciona
              a través del sitio web {DOMINIO_SITIO} (en adelante, "el Sitio").
            </p>
          </Section>

          <Section title="II. Datos personales que recabamos">
            <p>Para las finalidades descritas en este aviso, recabamos los siguientes datos:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Nombre completo</li>
              <li>Número de teléfono</li>
              <li>Correo electrónico (opcional)</li>
              <li>Notas o comentarios que usted incluya voluntariamente en sus solicitudes</li>
            </ul>
            <p className="mt-2">
              No recabamos datos sensibles (salud, origen étnico, creencias religiosas, etc.).
            </p>
          </Section>

          <Section title="III. Finalidades del tratamiento">
            <p>Sus datos se utilizan exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Dar seguimiento a su solicitud de cotización o contacto.</li>
              <li>Comunicarnos con usted para confirmar disponibilidad, precios y condiciones.</li>
              <li>Mejorar nuestros servicios de atención al cliente.</li>
            </ul>
            <p className="mt-2">
              Sus datos <strong>no se utilizan con fines publicitarios de terceros</strong> ni se
              venden a ninguna empresa.
            </p>
          </Section>

          <Section title="IV. Transferencias">
            <p>
              No realizamos transferencias de sus datos personales a terceros, salvo que sea
              requerido por autoridad competente en los términos de la ley aplicable.
            </p>
          </Section>

          <Section title="V. Derechos ARCO">
            <p>
              Usted tiene derecho a <strong>Acceder</strong>, <strong>Rectificar</strong>,{' '}
              <strong>Cancelar</strong> y <strong>Oponerse</strong> al tratamiento de sus datos
              (derechos ARCO), conforme a la Ley Federal de Protección de Datos Personales en
              Posesión de los Particulares (LFPDPPP).
            </p>
            <p className="mt-2">
              Para ejercer sus derechos, envíe un correo a{' '}
              <a href={`mailto:${AGENT_EMAIL}`} className="text-primary hover:underline">
                {AGENT_EMAIL}
              </a>{' '}
              indicando su nombre, el derecho que desea ejercer y una descripción clara de su
              solicitud. Le responderemos en un plazo máximo de 20 días hábiles.
            </p>
          </Section>

          <Section title="VI. Cookies y tecnologías de rastreo">
            <p>
              El Sitio no utiliza cookies de rastreo de terceros. Únicamente se almacena información
              en el navegador (localStorage) para mantener el carrito de compras y la sesión de
              usuario, sin compartir esta información con terceros.
            </p>
          </Section>

          <Section title="VII. Cambios al aviso de privacidad">
            <p>
              Cualquier modificación a este aviso se publicará en esta misma página con la fecha de
              actualización. Le recomendamos revisarla periódicamente.
            </p>
          </Section>

          <p className="mt-6 text-xs text-muted-foreground/60 text-center">
            Este aviso de privacidad está redactado conforme a la LFPDPPP y su Reglamento,
            aplicables en los Estados Unidos Mexicanos.
          </p>
        </div>
      </div>
    </div>
  )
}
