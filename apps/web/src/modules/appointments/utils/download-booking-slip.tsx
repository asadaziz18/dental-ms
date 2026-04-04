import { pdf } from '@react-pdf/renderer';
import type { Appointment } from '@dental-ms/shared-types';
import {
  AppointmentBookingSlipPDF,
  type BookingSlipPrintVariant,
  type ClinicSlipHeaderInfo,
} from '../components/AppointmentBookingSlipPDF';

export async function downloadAppointmentBookingSlip(params: {
  variant: BookingSlipPrintVariant;
  appointment: Appointment;
  clinic: ClinicSlipHeaderInfo;
  productOwnerFooter?: string | null;
}): Promise<void> {
  const blob = await pdf(
    <AppointmentBookingSlipPDF
      variant={params.variant}
      clinic={params.clinic}
      productOwnerFooter={params.productOwnerFooter}
      appointment={params.appointment}
    />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const tag = params.variant === 'thermal' ? 'thermal-80mm' : 'a4';
  a.download = `appointment-booking-${tag}-${params.appointment.id.slice(0, 8)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
