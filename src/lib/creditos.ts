/**
 * Créditos de las fotos que no son propias (INI-005). Espejo de
 * `ferratech-backend/catalogo/fuentes/commons/creditos.json`: al agregar ahí una foto con licencia
 * que pide crédito, agregarla también aquí.
 */
export interface CreditoImagen {
  producto: string
  slug: string
  autor: string
  licencia: string
  licenciaUrl?: string
  fuente: string
  cambios: string
}

export const CREDITOS_IMAGENES: CreditoImagen[] = [
  {
    producto: 'Cuchara de albañil',
    slug: 'cuchara-de-albanil',
    autor: 'Mike Lupinacci',
    licencia: 'CC BY-SA 3.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    fuente: 'https://commons.wikimedia.org/wiki/File:Masons_trowel.jpg',
    cambios: 'Fondo blanco, recorte cuadrado y grabado del fabricante cubierto.',
  },
  {
    producto: 'Martillo de uña curva',
    slug: 'martillo-una-curva',
    autor: 'Evan-Amos',
    licencia: 'Dominio público',
    fuente: 'https://commons.wikimedia.org/wiki/File:Claw-hammer.jpg',
    cambios: 'Fondo blanco, recorte cuadrado y grabado del fabricante cubierto.',
  },
]
