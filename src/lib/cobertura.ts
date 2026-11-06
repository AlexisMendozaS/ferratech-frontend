/**
 * Estados prioritarios de venta (INI-008, DEC-018) con algunas de sus ciudades principales.
 * Las entregas y sus tiempos se acuerdan con el vendedor según disponibilidad y cantidad.
 */
export interface EstadoCobertura {
  nombre: string
  ciudades: string[]
}

export const ESTADOS_PRIORITARIOS: EstadoCobertura[] = [
  { nombre: 'Hidalgo', ciudades: ['Pachuca', 'Tulancingo', 'Tula de Allende', 'Tizayuca', 'Tepeji del Río', 'Ixmiquilpan', 'Actopan', 'Huejutla'] },
  { nombre: 'Tlaxcala', ciudades: ['Tlaxcala', 'Apizaco', 'Huamantla', 'Chiautempan', 'Calpulalpan', 'Zacatelco'] },
  { nombre: 'Puebla', ciudades: ['Puebla', 'San Andrés Cholula', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Teziutlán', 'Huauchinango'] },
  { nombre: 'Veracruz', ciudades: ['Xalapa', 'Veracruz', 'Boca del Río', 'Córdoba', 'Orizaba', 'Poza Rica', 'Tuxpan', 'Coatzacoalcos'] },
  { nombre: 'Ciudad de México', ciudades: ['Iztapalapa', 'Gustavo A. Madero', 'Álvaro Obregón', 'Tlalpan', 'Coyoacán', 'Azcapotzalco', 'Xochimilco', 'Tláhuac'] },
  { nombre: 'Estado de México', ciudades: ['Toluca', 'Ecatepec', 'Naucalpan', 'Tlalnepantla', 'Nezahualcóyotl', 'Cuautitlán Izcalli', 'Texcoco', 'Tecámac', 'Atizapán de Zaragoza', 'Chalco'] },
]

export const POLITICA_ENTREGA =
  'Las entregas y sus tiempos se acuerdan con el vendedor según la disponibilidad y la cantidad de material. Te lo confirmamos junto con tu cotización, sin costo.'
