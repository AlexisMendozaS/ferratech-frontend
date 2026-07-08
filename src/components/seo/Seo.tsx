import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'FerraTech'
const DEFAULT_DESCRIPTION =
  'FerraTech — Catálogo de herramientas eléctricas, manuales y materiales de construcción. Solicita tu cotización en línea.'
const DEFAULT_OG_IMAGE = '/og-image.png'
const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://ferratech.com.mx'

interface SeoProps {
  title?: string         // Page-level title (without site name)
  description?: string
  image?: string         // Absolute or root-relative URL
  noindex?: boolean
  canonical?: string     // Override canonical URL
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  canonical,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
