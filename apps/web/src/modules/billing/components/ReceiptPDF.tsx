import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  title: { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 100, fontWeight: 'bold' },
  section: { marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: 'bold' },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  tableRow: { flexDirection: 'row', marginBottom: 2 },
  colDesc: { width: '40%' },
  colQty: { width: '15%' },
  colPrice: { width: '15%' },
  colDisc: { width: '15%' },
  colTotal: { width: '15%' },
  totals: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 2 },
  bold: { fontWeight: 'bold' },
  paymentRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 20 },
});

export interface ReceiptPDFProps {
  clinicName?: string;
  patientName: string;
  invoiceNumber: string | null;
  invoiceDate: string;
  dueDate: string | null;
  lineItems: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    discountAmount: string;
    lineTotal: string;
  }>;
  subtotal: string;
  discountAmount: string;
  taxRatePercent: string;
  taxAmount: string;
  total: string;
  payments: Array<{ amount: string; method: string; paidAt: string }>;
}

export function ReceiptPDF({
  clinicName = 'Dental Clinic',
  patientName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  lineItems,
  subtotal,
  discountAmount,
  taxRatePercent,
  taxAmount,
  total,
  payments,
}: ReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Receipt</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Clinic:</Text>
          <Text>{clinicName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Patient:</Text>
          <Text>{patientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice #:</Text>
          <Text>{invoiceNumber ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text>{invoiceDate}</Text>
        </View>
        {dueDate && (
          <View style={styles.row}>
            <Text style={styles.label}>Due date:</Text>
            <Text>{dueDate}</Text>
          </View>
        )}

        <Text style={styles.section}>Line items</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Unit</Text>
          <Text style={styles.colDisc}>Discount</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {lineItems.map((line, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{line.description}</Text>
            <Text style={styles.colQty}>{line.quantity}</Text>
            <Text style={styles.colPrice}>{line.unitPrice}</Text>
            <Text style={styles.colDisc}>{line.discountAmount}</Text>
            <Text style={styles.colTotal}>{line.lineTotal}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{subtotal}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Discount</Text>
            <Text>-{discountAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({taxRatePercent}%)</Text>
            <Text>{taxAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Total</Text>
            <Text style={styles.bold}>{total}</Text>
          </View>
        </View>

        {payments.length > 0 && (
          <>
            <Text style={styles.section}>Payments</Text>
            {payments.map((p, i) => (
              <View key={i} style={styles.paymentRow}>
                <Text>{p.paidAt} — {p.method}: {p.amount}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
