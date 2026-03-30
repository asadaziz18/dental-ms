import type { ScreenKey } from '@dental-ms/shared-types';

export const SCREEN_LABELS: Record<ScreenKey, string> = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  appointments: 'Appointments',
  treatments: 'Treatments',
  labs: 'Lab Management',
  billing: 'Billing',
  inventory: 'Inventory',
  staff: 'Staff',
  imaging: 'Imaging',
  reports: 'Reports',
  settings: 'Settings',
};

const PATH_TO_SCREEN: Record<string, ScreenKey> = {
  '': 'dashboard',
  dashboard: 'dashboard',
  patients: 'patients',
  appointments: 'appointments',
  treatments: 'treatments',
  labs: 'labs',
  billing: 'billing',
  inventory: 'inventory',
  staff: 'staff',
  imaging: 'imaging',
  reports: 'reports',
  settings: 'settings',
};

/**
 * Get the screen key for a pathname (e.g. /patients/123 -> patients).
 */
export function pathnameToScreenKey(pathname: string): ScreenKey {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  return (PATH_TO_SCREEN[segment] ?? 'dashboard') as ScreenKey;
}

/**
 * Whether the user can access the given screen.
 * If screenPermissions is undefined (e.g. before API returns it), allow access for backward compat.
 */
export function canAccessScreen(
  screenPermissions: Record<ScreenKey, boolean> | undefined,
  screenKey: ScreenKey,
): boolean {
  if (!screenPermissions) return true;
  return screenPermissions[screenKey] === true;
}
