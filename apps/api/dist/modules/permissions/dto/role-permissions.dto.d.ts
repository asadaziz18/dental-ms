import type { ScreenKey, UserRole } from '@dental-ms/shared-types';
export declare class UpdateRolePermissionsDto {
    role: UserRole;
    permissions: Partial<Record<ScreenKey, boolean>>;
}
