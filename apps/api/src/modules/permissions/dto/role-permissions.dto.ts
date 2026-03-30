import { IsObject, IsEnum } from 'class-validator';
import type { ScreenKey, UserRole } from '@dental-ms/shared-types';

const ROLES = ['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'] as const;
const SCREEN_KEYS = [
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
] as const;

export class UpdateRolePermissionsDto {
  @IsEnum(ROLES)
  role!: UserRole;

  @IsObject()
  permissions!: Partial<Record<ScreenKey, boolean>>;
}
