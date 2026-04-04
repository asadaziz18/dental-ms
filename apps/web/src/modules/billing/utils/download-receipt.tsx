import { pdf } from '@react-pdf/renderer';
import {
  ReceiptPDF,
  getInvoicePdfDisplayRef,
  type ReceiptPDFProps,
} from '../components/ReceiptPDF';

export async function downloadReceiptPdf(props: ReceiptPDFProps): Promise<void> {
  const blob = await pdf(<ReceiptPDF {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const tag = props.variant === 'thermal' ? 'thermal-80mm' : 'a4';
  const ref = getInvoicePdfDisplayRef(props.invoiceNumber, props.invoiceId);
  const safe = ref.replace(/[^\w.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || props.invoiceId.slice(0, 8);
  a.download = `receipt-${tag}-${safe}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
