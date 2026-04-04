/**
 * Shared TypeScript types and DTOs for Dental MS (web + api)
 */

export type SyncStatus = 'synced' | 'pending' | 'conflict';

export type UserRole =
  | 'SuperAdmin'
  | 'BranchAdmin'
  | 'Doctor'
  | 'Receptionist'
  | 'Nurse';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  branchId: string | null;
  allowedBranches?: string[];
  email: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/** Screen keys used for role/user permission toggles (nav/screen access) */
export type ScreenKey =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'treatments'
  | 'labs'
  | 'billing'
  | 'inventory'
  | 'staff'
  | 'imaging'
  | 'reports'
  | 'settings';

export const SCREEN_KEYS: ScreenKey[] = [
  'dashboard',
  'patients',
  'appointments',
  'treatments',
  'labs',
  'billing',
  'inventory',
  'staff',
  'imaging',
  'reports',
  'settings',
];

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
  allowedBranches: string[];
  /** Effective screen access (role defaults + user overrides). Present after login/me. */
  screenPermissions?: Record<ScreenKey, boolean>;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export * from './sync';
export * from './patient';
export * from './appointment';
export * from './treatment';
export * from './billing';
export * from './inventory';
export * from './staff';
export * from './imaging';
export * from './reports';
export * from './subscription';
export * from './lab';
export * from './platform-settings';
