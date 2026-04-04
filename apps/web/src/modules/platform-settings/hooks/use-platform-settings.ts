import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformSettingsApi } from '../api';

export const platformSettingsKeys = {
  all: ['platform-settings'] as const,
  bookingSlip: () => [...platformSettingsKeys.all, 'booking-slip'] as const,
};

export function useBookingSlipPlatformSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: platformSettingsKeys.bookingSlip(),
    queryFn: () => platformSettingsApi.getBookingSlip(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useUpdateBookingSlipFooterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productOwnerFooter: string | null) =>
      platformSettingsApi.updateBookingSlip({ productOwnerFooter }),
    onSuccess: (data) => {
      qc.setQueryData(platformSettingsKeys.bookingSlip(), data);
    },
  });
}
