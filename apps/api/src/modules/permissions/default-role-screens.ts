import type { UserRole } from '../../database/entities/user.entity';
import type { ScreenKey } from '@dental-ms/shared-types';

/**
 * Default screen access per role when no DB override exists.
 * Aligned with PERMISSION_MATRIX.md and route access.
 */
export const DEFAULT_ROLE_SCREENS: Record<UserRole, Record<ScreenKey, boolean>> = {
  SuperAdmin: {
    dashboard: true,
    patients: true,
    appointments: true,
    treatments: true,
    labs: true,
    billing: true,
    inventory: true,
    staff: true,
    imaging: true,
    reports: true,
    settings: true,
  },
  BranchAdmin: {
    dashboard: true,
    patients: true,
    appointments: true,
    treatments: true,
    labs: true,
    billing: true,
    inventory: true,
    staff: true,
    imaging: true,
    reports: true,
    settings: true,
  },
  Doctor: {
    dashboard: true,
    patients: true,
    appointments: true,
    treatments: true,
    labs: true,
    billing: false,
    inventory: false,
    staff: false,
    imaging: true,
    reports: true,
    settings: false,
  },
  Receptionist: {
    dashboard: true,
    patients: true,
    appointments: true,
    treatments: false,
    labs: true,
    billing: true,
    inventory: false,
    staff: false,
    imaging: true,
    reports: false,
    settings: false,
  },
  Nurse: {
    dashboard: true,
    patients: true,
    appointments: true,
    treatments: true,
    labs: false,
    billing: false,
    inventory: false,
    staff: false,
    imaging: true,
    reports: false,
    settings: false,
  },
};
