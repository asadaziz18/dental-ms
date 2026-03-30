import { Repository } from 'typeorm';
import { RoleScreenPermission } from '../../database/entities/role-screen-permission.entity';
import { UserScreenOverride } from '../../database/entities/user-screen-override.entity';
import { User } from '../../database/entities/user.entity';
import type { ScreenKey, UserRole } from '@dental-ms/shared-types';
export declare class PermissionsService {
    private readonly rolePermRepo;
    private readonly userOverrideRepo;
    private readonly userRepo;
    constructor(rolePermRepo: Repository<RoleScreenPermission>, userOverrideRepo: Repository<UserScreenOverride>, userRepo: Repository<User>);
    getEffectivePermissions(userId: string, role: UserRole, branchId: string | null): Promise<Record<ScreenKey, boolean>>;
    getRolePermissions(role: UserRole): Promise<Record<ScreenKey, boolean>>;
    setRolePermissions(role: UserRole, permissions: Partial<Record<ScreenKey, boolean>>): Promise<Record<ScreenKey, boolean>>;
    getUserOverrides(userId: string, branchId: string): Promise<Partial<Record<ScreenKey, boolean>>>;
    setUserOverrides(userId: string, branchId: string, overrides: Partial<Record<ScreenKey, boolean>>): Promise<Partial<Record<ScreenKey, boolean>>>;
    getAllRolePermissions(): Promise<Record<UserRole, Record<ScreenKey, boolean>>>;
}
