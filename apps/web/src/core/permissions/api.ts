import { api } from '../api/client';
import type { ScreenKey, UserRole } from '@dental-ms/shared-types';

export type RolePermissionsMap = Record<UserRole, Record<ScreenKey, boolean>>;
export type UserOverridesMap = Partial<Record<ScreenKey, boolean>>;

export async function getRolePermissions(): Promise<RolePermissionsMap> {
  const { data } = await api.get<RolePermissionsMap>('/permissions/roles');
  return data;
}

export async function updateRolePermissions(
  role: UserRole,
  permissions: Partial<Record<ScreenKey, boolean>>,
): Promise<Record<ScreenKey, boolean>> {
  const { data } = await api.put<Record<ScreenKey, boolean>>('/permissions/roles', {
    role,
    permissions,
  });
  return data;
}

export async function getUserOverrides(userId: string): Promise<UserOverridesMap> {
  const { data } = await api.get<UserOverridesMap>(`/permissions/users/${userId}`);
  return data;
}

export async function setUserOverrides(
  userId: string,
  overrides: Partial<Record<ScreenKey, boolean>>,
): Promise<UserOverridesMap> {
  const { data } = await api.put<UserOverridesMap>(`/permissions/users/${userId}`, {
    overrides,
  });
  return data;
}
