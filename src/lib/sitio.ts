/**
 * Dominio público del sitio, sin `https://`: el de `PUBLIC_SITE_URL` si está configurado
 * (https://ferratech.vercel.app hoy) y, si no, el de la página actual. Para textos visibles
 * (vista previa en Google, aviso de privacidad, PDF de la cotización).
 */
export const DOMINIO_SITIO = (
  import.meta.env.PUBLIC_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'ferratech.vercel.app')
)
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')
