import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type {
  BookingSlipPrintVariant,
  ClinicSlipHeaderInfo,
} from '@/modules/appointments/components/AppointmentBookingSlipPDF';
import {
  THERMAL_WIDTH_PT,
  formatHours,
  joinAddress,
} from '@/core/pdf/clinic-helpers';

const THERMAL_PAGE_HEIGHT = 1400;

const standard = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  clinicName: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  clinicMeta: { fontSize: 9, color: '#333', marginBottom: 2 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 12,
    marginBottom: 14,
    paddingBottom: 4,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  invoiceRef: { fontSize: 12, fontWeight: 'bold', marginBottom: 12, color: '#111' },
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
  footerWrap: { marginTop: 24, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  footerOwner: { fontSize: 8, color: '#444', marginBottom: 4 },
  footerGen: { fontSize: 8, color: '#666' },
});

const thermal = StyleSheet.create({
  page: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: 'Courier',
  },
  clinicName: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  clinicLine: { fontSize: 7, textAlign: 'center', marginBottom: 2 },
  rule: { borderTopWidth: 1, borderTopColor: '#000', marginVertical: 6 },
  title: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  invoiceRef: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  block: { marginBottom: 5 },
  label: { fontSize: 7, color: '#333', marginBottom: 1 },
  value: { fontSize: 8, fontWeight: 'bold' },
  lineItemBox: { marginBottom: 8, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: '#999' },
  lineDesc: { fontSize: 7, marginBottom: 2 },
  lineNums: { fontSize: 7 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  payLine: { fontSize: 7, marginBottom: 3 },
  sectionHeading: { fontSize: 7, fontWeight: 'bold', marginBottom: 4 },
  footerOwner: { fontSize: 7, textAlign: 'center', marginTop: 8 },
  footerGen: { fontSize: 6, textAlign: 'center', color: '#555', marginTop: 4 },
});

export interface ReceiptLineItemPdf {
  description: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  lineTotal: string;
}

export interface ReceiptPaymentPdf {
  amount: string;
  method: string;
  paidAt: string;
}

/** Prefer assigned invoice number; otherwise show internal id (full UUID on PDF for traceability). */
export function getInvoicePdfDisplayRef(
  invoiceNumber: string | null | undefined,
  invoiceId: string,
): string {
  const n = invoiceNumber?.trim();
  if (n) return n;
  return invoiceId;
}

export interface ReceiptPDFProps {
  variant: BookingSlipPrintVariant;
  clinic: ClinicSlipHeaderInfo;
  /** Product-owner line from platform settings (Super Admin). */
  productOwnerFooter?: string | null;
  patientName: string;
  invoiceNumber: string | null;
  /** Invoice row id — used on the PDF and filename when invoiceNumber is empty. */
  invoiceId: string;
  invoiceDate: string;
  dueDate: string | null;
  lineItems: ReceiptLineItemPdf[];
  subtotal: string;
  discountAmount: string;
  taxRatePercent: string;
  taxAmount: string;
  total: string;
  payments: ReceiptPaymentPdf[];
}

function StandardReceiptPage(props: ReceiptPDFProps) {
  const {
    clinic,
    productOwnerFooter,
    patientName,
    invoiceNumber,
    invoiceId,
    invoiceDate,
    dueDate,
    lineItems,
    subtotal,
    discountAmount,
    taxRatePercent,
    taxAmount,
    total,
    payments,
  } = props;
  const addr = joinAddress(clinic.address, clinic.city);
  const hours = formatHours(clinic.openingTime, clinic.closingTime);
  const invoiceRef = getInvoicePdfDisplayRef(invoiceNumber, invoiceId);

  return (
    <Page size="A4" style={standard.page}>
      <Text style={standard.clinicName}>{clinic.name}</Text>
      {clinic.code?.trim() ? (
        <Text style={standard.clinicMeta}>Branch code: {clinic.code}</Text>
      ) : null}
      {addr ? <Text style={standard.clinicMeta}>{addr}</Text> : null}
      {clinic.phone?.trim() ? (
        <Text style={standard.clinicMeta}>Phone: {clinic.phone}</Text>
      ) : null}
      {clinic.email?.trim() ? (
        <Text style={standard.clinicMeta}>Email: {clinic.email}</Text>
      ) : null}
      {hours ? <Text style={standard.clinicMeta}>Hours: {hours}</Text> : null}

      <View style={standard.divider}>
        <Text style={standard.title}>Receipt / Invoice</Text>
        <Text style={standard.invoiceRef}>Invoice # {invoiceRef}</Text>
      </View>

      <View style={standard.row}>
        <Text style={standard.label}>Patient:</Text>
        <Text>{patientName}</Text>
      </View>
      <View style={standard.row}>
        <Text style={standard.label}>Date:</Text>
        <Text>{invoiceDate}</Text>
      </View>
      {dueDate ? (
        <View style={standard.row}>
          <Text style={standard.label}>Due date:</Text>
          <Text>{dueDate}</Text>
        </View>
      ) : null}

      <Text style={standard.section}>Line items</Text>
      <View style={standard.tableHeader}>
        <Text style={standard.colDesc}>Description</Text>
        <Text style={standard.colQty}>Qty</Text>
        <Text style={standard.colPrice}>Unit</Text>
        <Text style={standard.colDisc}>Discount</Text>
        <Text style={standard.colTotal}>Total</Text>
      </View>
      {lineItems.map((line, i) => (
        <View key={i} style={standard.tableRow}>
          <Text style={standard.colDesc}>{line.description}</Text>
          <Text style={standard.colQty}>{line.quantity}</Text>
          <Text style={standard.colPrice}>{line.unitPrice}</Text>
          <Text style={standard.colDisc}>{line.discountAmount}</Text>
          <Text style={standard.colTotal}>{line.lineTotal}</Text>
        </View>
      ))}

      <View style={standard.totals}>
        <View style={standard.totalRow}>
          <Text>Subtotal</Text>
          <Text>{subtotal}</Text>
        </View>
        <View style={standard.totalRow}>
          <Text>Discount</Text>
          <Text>-{discountAmount}</Text>
        </View>
        <View style={standard.totalRow}>
          <Text>Tax ({taxRatePercent}%)</Text>
          <Text>{taxAmount}</Text>
        </View>
        <View style={standard.totalRow}>
          <Text style={standard.bold}>Total</Text>
          <Text style={standard.bold}>{total}</Text>
        </View>
      </View>

      {payments.length > 0 ? (
        <>
          <Text style={standard.section}>Payments</Text>
          {payments.map((p, i) => (
            <View key={i} style={standard.paymentRow}>
              <Text>
                {p.paidAt} — {p.method}: {p.amount}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      <View style={standard.footerWrap}>
        {productOwnerFooter?.trim() ? (
          <Text style={standard.footerOwner}>{productOwnerFooter.trim()}</Text>
        ) : null}
        <Text style={standard.footerGen}>Generated {new Date().toLocaleString()}</Text>
      </View>
    </Page>
  );
}

function ThermalReceiptPage(props: ReceiptPDFProps) {
  const {
    clinic,
    productOwnerFooter,
    patientName,
    invoiceNumber,
    invoiceId,
    invoiceDate,
    dueDate,
    lineItems,
    subtotal,
    discountAmount,
    taxRatePercent,
    taxAmount,
    total,
    payments,
  } = props;
  const addr = joinAddress(clinic.address, clinic.city);
  const hours = formatHours(clinic.openingTime, clinic.closingTime);
  const invoiceRef = getInvoicePdfDisplayRef(invoiceNumber, invoiceId);

  return (
    <Page size={[THERMAL_WIDTH_PT, THERMAL_PAGE_HEIGHT]} wrap={false} style={thermal.page}>
      <Text style={thermal.clinicName}>{clinic.name}</Text>
      {clinic.code?.trim() ? (
        <Text style={thermal.clinicLine}>Code: {clinic.code}</Text>
      ) : null}
      {addr ? <Text style={thermal.clinicLine}>{addr}</Text> : null}
      {clinic.phone?.trim() ? (
        <Text style={thermal.clinicLine}>Tel: {clinic.phone}</Text>
      ) : null}
      {clinic.email?.trim() ? <Text style={thermal.clinicLine}>{clinic.email}</Text> : null}
      {hours ? <Text style={thermal.clinicLine}>Hours: {hours}</Text> : null}

      <View style={thermal.rule} />
      <Text style={thermal.title}>RECEIPT / INVOICE</Text>
      <Text style={thermal.invoiceRef}>Invoice # {invoiceRef}</Text>

      <View style={thermal.block}>
        <Text style={thermal.label}>Patient</Text>
        <Text style={thermal.value}>{patientName}</Text>
      </View>
      <View style={thermal.block}>
        <Text style={thermal.label}>Date</Text>
        <Text style={thermal.value}>{invoiceDate}</Text>
      </View>
      {dueDate ? (
        <View style={thermal.block}>
          <Text style={thermal.label}>Due</Text>
          <Text style={thermal.value}>{dueDate}</Text>
        </View>
      ) : null}

      <View style={thermal.rule} />
      <Text style={thermal.sectionHeading}>Line items</Text>
      {lineItems.map((line, i) => (
        <View key={i} style={thermal.lineItemBox}>
          <Text style={thermal.lineDesc}>{line.description}</Text>
          <Text style={thermal.lineNums}>
            Qty {line.quantity} × {line.unitPrice} | Disc {line.discountAmount} | Line{' '}
            {line.lineTotal}
          </Text>
        </View>
      ))}

      <View style={thermal.rule} />
      <View style={thermal.totalLine}>
        <Text style={thermal.label}>Subtotal</Text>
        <Text style={thermal.value}>{subtotal}</Text>
      </View>
      <View style={thermal.totalLine}>
        <Text style={thermal.label}>Discount</Text>
        <Text style={thermal.value}>-{discountAmount}</Text>
      </View>
      <View style={thermal.totalLine}>
        <Text style={thermal.label}>Tax ({taxRatePercent}%)</Text>
        <Text style={thermal.value}>{taxAmount}</Text>
      </View>
      <View style={thermal.totalLine}>
        <Text style={thermal.label}>TOTAL</Text>
        <Text style={thermal.value}>{total}</Text>
      </View>

      {payments.length > 0 ? (
        <>
          <View style={thermal.rule} />
          <Text style={thermal.sectionHeading}>Payments</Text>
          {payments.map((p, i) => (
            <Text key={i} style={thermal.payLine}>
              {p.paidAt} {p.method} {p.amount}
            </Text>
          ))}
        </>
      ) : null}

      <View style={thermal.rule} />
      {productOwnerFooter?.trim() ? (
        <Text style={thermal.footerOwner}>{productOwnerFooter.trim()}</Text>
      ) : null}
      <Text style={thermal.footerGen}>{new Date().toLocaleString()}</Text>
    </Page>
  );
}

export function ReceiptPDF(props: ReceiptPDFProps) {
  const suffix = ` ${getInvoicePdfDisplayRef(props.invoiceNumber, props.invoiceId)}`;
  const docTitle =
    props.variant === 'thermal'
      ? `Receipt (thermal 80mm)${suffix}`
      : `Receipt (A4)${suffix}`;
  return (
    <Document title={docTitle}>
      {props.variant === 'thermal' ? (
        <ThermalReceiptPage {...props} />
      ) : (
        <StandardReceiptPage {...props} />
      )}
    </Document>
  );
}
