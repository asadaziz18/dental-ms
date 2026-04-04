import { api } from '@/core/api/client';
import type { BookingSlipPlatformSettings } from '@dental-ms/shared-types';

export const platformSettingsApi = {
  getBookingSlip(): Promise<BookingSlipPlatformSettings> {
    return api
      .get<BookingSlipPlatformSettings>('/platform-settings/booking-slip')
      .then((r) => r.data);
  },

  updateBookingSlip(
    body: { productOwnerFooter: string | null },
  ): Promise<BookingSlipPlatformSettings> {
    return api
      .put<BookingSlipPlatformSettings>('/platform-settings/booking-slip', body)
      .then((r) => r.data);
  },
};
