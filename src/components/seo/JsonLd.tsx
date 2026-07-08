/**
 * Inyecta un bloque JSON-LD en el <head> usando un <script> estático.
 * No usa Helmet para evitar doble serialización.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint: JSON-LD must be injected as raw HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
