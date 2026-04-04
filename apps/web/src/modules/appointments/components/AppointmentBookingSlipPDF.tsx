import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Appointment, AppointmentType } from '@dental-ms/shared-types';
import {
  THERMAL_WIDTH_PT,
  formatHours,
  joinAddress,
} from '@/core/pdf/clinic-helpers';

const THERMAL_PAGE_HEIGHT = 1200;

const standardStyles = StyleSheet.create({
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
  docTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  docHint: { fontSize: 9, color: '#555', marginBottom: 16 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: 128, fontWeight: 'bold' },
  footerWrap: { marginTop: 28, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  footerOwner: { fontSize: 8, color: '#444', marginBottom: 4 },
  footerGen: { fontSize: 8, color: '#666' },
});

const thermalStyles = StyleSheet.create({
  /** Page dimensions come from the Page `size` prop; Courier distinguishes thermal from A4 Helvetica. */
  page: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: 'Courier',
  },
  clinicName: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  clinicLine: { fontSize: 7, textAlign: 'center', color: '#222', marginBottom: 2 },
  rule: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginVertical: 8,
  },
  docTitle: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  block: { marginBottom: 6 },
  label: { fontSize: 7, color: '#333', marginBottom: 1 },
  value: { fontSize: 8, fontWeight: 'bold' },
  footerOwner: { fontSize: 7, textAlign: 'center', color: '#333', marginTop: 10 },
  footerGen: { fontSize: 6, textAlign: 'center', color: '#555', marginTop: 4 },
});

const TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: 'Consultation',
  procedure: 'Procedure',
  'follow-up': 'Follow-up',
};

function formatType(type: AppointmentType): string {
  return TYPE_LABELS[type] ?? type;
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  };
  return `${start.toLocaleString(undefined, opts)} — ${end.toLocaleString(undefined, opts)}`;
}

export type BookingSlipPrintVariant = 'standard' | 'thermal';

export interface ClinicSlipHeaderInfo {
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  code?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
}

export interface AppointmentBookingSlipPDFProps {
  variant: BookingSlipPrintVariant;
  clinic: ClinicSlipHeaderInfo;
  /** Product-owner line from platform settings (Super Admin). */
  productOwnerFooter?: string | null;
  appointment: Appointment;
}

function slipBodyFields(appointment: Appointment) {
  const patientName = appointment.patient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim()
    : '—';
  const doctorName = appointment.doctor?.fullName ?? 'Not assigned';
  return {
    patientName,
    doctorName,
    bookingRef: appointment.id,
    chair: appointment.chair?.trim() ? appointment.chair : '—',
    when: formatRange(appointment.start, appointment.end),
    visitType: formatType(appointment.type),
    status: appointment.status,
    reminder: appointment.sendReminder ? 'Yes' : 'No',
    notes: appointment.notes?.trim() ? appointment.notes : null,
  };
}

function StandardSlipPage({
  clinic,
  productOwnerFooter,
  appointment,
}: Omit<AppointmentBookingSlipPDFProps, 'variant'>) {
  const f = slipBodyFields(appointment);
  const addr = joinAddress(clinic.address, clinic.city);
  const hours = formatHours(clinic.openingTime, clinic.closingTime);

  return (
    <Page size="A4" style={standardStyles.page}>
      <Text style={standardStyles.clinicName}>{clinic.name}</Text>
      {clinic.code?.trim() ? (
        <Text style={standardStyles.clinicMeta}>Branch code: {clinic.code}</Text>
      ) : null}
      {addr ? <Text style={standardStyles.clinicMeta}>{addr}</Text> : null}
      {clinic.phone?.trim() ? (
        <Text style={standardStyles.clinicMeta}>Phone: {clinic.phone}</Text>
      ) : null}
      {clinic.email?.trim() ? (
        <Text style={standardStyles.clinicMeta}>Email: {clinic.email}</Text>
      ) : null}
      {hours ? (
        <Text style={standardStyles.clinicMeta}>Hours: {hours}</Text>
      ) : null}

      <View style={standardStyles.divider}>
        <Text style={standardStyles.docTitle}>Appointment booking slip</Text>
        <Text style={standardStyles.docHint}>
          Bring this slip or show it on your phone when you arrive.
        </Text>
      </View>

      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Booking reference:</Text>
        <Text>{f.bookingRef}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Patient:</Text>
        <Text>{f.patientName}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Dentist / doctor:</Text>
        <Text>{f.doctorName}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Chair / room:</Text>
        <Text>{f.chair}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Date & time:</Text>
        <Text>{f.when}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Visit type:</Text>
        <Text>{f.visitType}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Status:</Text>
        <Text>{f.status}</Text>
      </View>
      <View style={standardStyles.row}>
        <Text style={standardStyles.label}>Reminder:</Text>
        <Text>{f.reminder}</Text>
      </View>
      {f.notes ? (
        <View style={standardStyles.row}>
          <Text style={standardStyles.label}>Notes:</Text>
          <Text style={{ flex: 1 }}>{f.notes}</Text>
        </View>
      ) : null}

      <View style={standardStyles.footerWrap}>
        {productOwnerFooter?.trim() ? (
          <Text style={standardStyles.footerOwner}>{productOwnerFooter.trim()}</Text>
        ) : null}
        <Text style={standardStyles.footerGen}>
          Generated {new Date().toLocaleString()}
        </Text>
      </View>
    </Page>
  );
}

function ThermalSlipPage({
  clinic,
  productOwnerFooter,
  appointment,
}: Omit<AppointmentBookingSlipPDFProps, 'variant'>) {
  const f = slipBodyFields(appointment);
  const addr = joinAddress(clinic.address, clinic.city);
  const hours = formatHours(clinic.openingTime, clinic.closingTime);

  return (
    <Page
      size={[THERMAL_WIDTH_PT, THERMAL_PAGE_HEIGHT]}
      wrap={false}
      style={thermalStyles.page}
    >
      <Text style={thermalStyles.clinicName}>{clinic.name}</Text>
      {clinic.code?.trim() ? (
        <Text style={thermalStyles.clinicLine}>Code: {clinic.code}</Text>
      ) : null}
      {addr ? <Text style={thermalStyles.clinicLine}>{addr}</Text> : null}
      {clinic.phone?.trim() ? (
        <Text style={thermalStyles.clinicLine}>Tel: {clinic.phone}</Text>
      ) : null}
      {clinic.email?.trim() ? (
        <Text style={thermalStyles.clinicLine}>{clinic.email}</Text>
      ) : null}
      {hours ? (
        <Text style={thermalStyles.clinicLine}>Hours: {hours}</Text>
      ) : null}

      <View style={thermalStyles.rule} />
      <Text style={thermalStyles.docTitle}>APPOINTMENT SLIP</Text>

      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Reference</Text>
        <Text style={thermalStyles.value}>{f.bookingRef}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Patient</Text>
        <Text style={thermalStyles.value}>{f.patientName}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Doctor</Text>
        <Text style={thermalStyles.value}>{f.doctorName}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Chair / room</Text>
        <Text style={thermalStyles.value}>{f.chair}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Date & time</Text>
        <Text style={thermalStyles.value}>{f.when}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Visit type</Text>
        <Text style={thermalStyles.value}>{f.visitType}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Status</Text>
        <Text style={thermalStyles.value}>{f.status}</Text>
      </View>
      <View style={thermalStyles.block}>
        <Text style={thermalStyles.label}>Reminder</Text>
        <Text style={thermalStyles.value}>{f.reminder}</Text>
      </View>
      {f.notes ? (
        <View style={thermalStyles.block}>
          <Text style={thermalStyles.label}>Notes</Text>
          <Text style={thermalStyles.value}>{f.notes}</Text>
        </View>
      ) : null}

      <View style={thermalStyles.rule} />
      {productOwnerFooter?.trim() ? (
        <Text style={thermalStyles.footerOwner}>{productOwnerFooter.trim()}</Text>
      ) : null}
      <Text style={thermalStyles.footerGen}>
        {new Date().toLocaleString()}
      </Text>
    </Page>
  );
}

export function AppointmentBookingSlipPDF({
  variant,
  clinic,
  productOwnerFooter,
  appointment,
}: AppointmentBookingSlipPDFProps) {
  const body = { clinic, productOwnerFooter, appointment };
  const docTitle =
    variant === 'thermal'
      ? 'Appointment booking slip (thermal 80mm)'
      : 'Appointment booking slip (A4)';
  return (
    <Document title={docTitle}>
      {variant === 'thermal' ? (
        <ThermalSlipPage {...body} />
      ) : (
        <StandardSlipPage {...body} />
      )}
    </Document>
  );
}
