import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

import type { CartItem } from '@/store/carritoStore'
import type { ClienteData } from '@/services/cotizaciones'

/* ── Estilos ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
    color: '#1a1a1a',
  },
  /* Encabezado */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e85d04',
  },
  brand: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#e85d04',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  docTitle: {
    textAlign: 'right',
  },
  docTitleText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  docDate: {
    fontSize: 8,
    color: '#666',
    marginTop: 3,
  },
  /* Secciones */
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#e85d04',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    width: 80,
    fontFamily: 'Helvetica-Bold',
    color: '#444',
  },
  infoValue: {
    flex: 1,
    color: '#1a1a1a',
  },
  /* Tabla de productos */
  table: {
    marginTop: 4,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  colNum: { width: 28, fontFamily: 'Helvetica-Bold', color: '#666' },
  colNombre: { flex: 1 },
  colVariante: { width: 120 },
  colCantidad: { width: 60, textAlign: 'center' },
  headText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#444',
  },
  /* Total */
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginRight: 12,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#e85d04',
    minWidth: 40,
    textAlign: 'right',
  },
  /* Notas */
  notasBox: {
    backgroundColor: '#fffbf5',
    borderWidth: 1,
    borderColor: '#f5d9b5',
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  notasText: {
    color: '#555',
    lineHeight: 1.5,
  },
  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
})

/* ── Props ────────────────────────────────────────────────── */
export interface CotizacionPDFProps {
  cliente: ClienteData
  items: CartItem[]
  fecha?: string
  folio?: string
}

/* ── Componente ──────────────────────────────────────────── */
export function CotizacionPDF({ cliente, items, fecha, folio }: CotizacionPDFProps) {
  const fechaStr =
    fecha ?? new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <Document
      title={`Cotización FerraTech — ${cliente.nombre}`}
      author="FerraTech"
      subject="Solicitud de cotización"
    >
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>FerraTech</Text>
            <Text style={styles.brandSub}>Ferretería y Materiales</Text>
          </View>
          <View style={styles.docTitle}>
            <Text style={styles.docTitleText}>Solicitud de Cotización</Text>
            {folio && <Text style={styles.docDate}>Folio: {folio}</Text>}
            <Text style={styles.docDate}>Fecha: {fechaStr}</Text>
          </View>
        </View>

        {/* Datos del cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{cliente.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{cliente.telefono}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo:</Text>
            <Text style={styles.infoValue}>{cliente.email}</Text>
          </View>
        </View>

        {/* Detalle de productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Solicitados</Text>
          <View style={styles.table}>
            {/* Encabezado tabla */}
            <View style={styles.tableHead}>
              <Text style={[styles.colNum, styles.headText]}>#</Text>
              <Text style={[styles.colNombre, styles.headText]}>Producto</Text>
              <Text style={[styles.colVariante, styles.headText]}>Variante</Text>
              <Text style={[styles.colCantidad, styles.headText]}>Cant.</Text>
            </View>

            {/* Filas */}
            {items.map((item, idx) => (
              <View
                key={`${item.id_producto}-${item.variante_seleccionada}`}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}
              >
                <Text style={styles.colNum}>{idx + 1}</Text>
                <Text style={styles.colNombre}>{item.nombre}</Text>
                <Text style={styles.colVariante}>
                  {item.variante_seleccionada ?? '—'}
                </Text>
                <Text style={styles.colCantidad}>{item.cantidad}</Text>
              </View>
            ))}
          </View>

          {/* Total unidades */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total de piezas:</Text>
            <Text style={styles.totalValue}>{totalItems}</Text>
          </View>
        </View>

        {/* Notas del cliente */}
        {cliente.notas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas Adicionales</Text>
            <View style={styles.notasBox}>
              <Text style={styles.notasText}>{cliente.notas}</Text>
            </View>
          </View>
        )}

        {/* Aviso de precios */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={{ fontSize: 8, color: '#888', fontStyle: 'italic' }}>
            * Los precios serán confirmados por el agente de ventas al contactarte. Esta solicitud no constituye una orden de compra.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          FerraTech — Ferretería y Materiales | ferratech.com.mx | Todos los derechos reservados
        </Text>
      </Page>
    </Document>
  )
}
