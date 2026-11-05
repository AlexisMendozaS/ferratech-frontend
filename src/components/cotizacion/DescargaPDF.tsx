/**
 * Botón para descargar la cotización en PDF. Vive aparte para cargarse con `lazy`: la librería
 * de PDF pesa más de 1 MB y solo hace falta después de enviar la cotización.
 */
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'

import { CotizacionPDF } from '@/components/cotizacion/CotizacionPDF'
import { Button } from '@/components/ui/button'
import type { ClienteData } from '@/services/cotizaciones'
import type { CartItem } from '@/store/carritoStore'

interface Props {
  cliente: ClienteData
  items: CartItem[]
  fileName: string
}

export default function DescargaPDF({ cliente, items, fileName }: Props) {
  return (
    <PDFDownloadLink document={<CotizacionPDF cliente={cliente} items={items} />} fileName={fileName}>
      {({ loading, error }) =>
        error ? null : (
          <Button variant="outline" className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {loading ? 'Generando PDF...' : 'Descargar cotización (PDF)'}
          </Button>
        )
      }
    </PDFDownloadLink>
  )
}
