/**
 * Platform-wide PDF footer (slips, receipts, reports, user manual). Super Admin only via API.
 */
export interface BookingSlipPlatformSettings {
  productOwnerFooter: string | null;
}
