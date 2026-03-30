import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleScreenPermission } from '../../database/entities/role-screen-permission.entity';
import { UserScreenOverride } from '../../database/entities/user-screen-override.entity';
import { User } from '../../database/entities/user.entity';
import { DEFAULT_ROLE_SCREENS } from './default-role-screens';
import type { ScreenKey, UserRole } from '@dental-ms/shared-types';
import { SCREEN_KEYS } from '@dental-ms/shared-types';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(RoleScreenPermission)
    private readonly rolePermRepo: Repository<RoleScreenPermission>,
    @InjectRepository(UserScreenOverride)
    private readonly userOverrideRepo: Repository<UserScreenOverride>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Get effective screen permissions for a user (role defaults + user overrides). */
  async getEffectivePermissions(
    userId: string,
    role: UserRole,
    branchId: string | null,
  ): Promise<Record<ScreenKey, boolean>> {
    const rolePerms = await this.getRolePermissions(role);
    if (!branchId) {
      return rolePerms as Record<ScreenKey, boolean>;
    }
    const overrides = await this.userOverrideRepo.find({
      where: { userId, branchId },
    });
    const result = { ...rolePerms } as Record<ScreenKey, boolean>;
    for (const o of overrides) {
      result[o.screenKey as ScreenKey] = o.allowed;
    }
    return result;
  }

  /** Get permissions for a role (DB overrides or default matrix). */
  async getRolePermissions(role: UserRole): Promise<Record<ScreenKey, boolean>> {
    const defaults = DEFAULT_ROLE_SCREENS[role];
    const rows = await this.rolePermRepo.find({ where: { role } });
    const result = { ...defaults } as Record<ScreenKey, boolean>;
    for (const r of rows) {
      result[r.screenKey as ScreenKey] = r.allowed;
    }
    return result;
  }

  /** Set role permissions (SuperAdmin only). */
  async setRolePermissions(
    role: UserRole,
    permissions: Partial<Record<ScreenKey, boolean>>,
  ): Promise<Record<ScreenKey, boolean>> {
    for (const screenKey of SCREEN_KEYS) {
      const allowed = permissions[screenKey];
      if (allowed === undefined) continue;
      await this.rolePermRepo.upsert(
        { role, screenKey, allowed },
        { conflictPaths: ['role', 'screenKey'] },
      );
    }
    return this.getRolePermissions(role);
  }

  /** Get user screen overrides for a user in a branch. */
  async getUserOverrides(
    userId: string,
    branchId: string,
  ): Promise<Partial<Record<ScreenKey, boolean>>> {
    const rows = await this.userOverrideRepo.find({
      where: { userId, branchId },
    });
    const result: Partial<Record<ScreenKey, boolean>> = {};
    for (const r of rows) {
      result[r.screenKey as ScreenKey] = r.allowed;
    }
    return result;
  }

  /** Set user screen overrides. Caller must ensure BranchAdmin can only set for their branch. */
  async setUserOverrides(
    userId: string,
    branchId: string,
    overrides: Partial<Record<ScreenKey, boolean>>,
  ): Promise<Partial<Record<ScreenKey, boolean>>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Don't allow overrides for SuperAdmin
    if (user.role === 'SuperAdmin') {
      throw new ForbiddenException('Cannot set screen overrides for SuperAdmin');
    }
    for (const screenKey of SCREEN_KEYS) {
      const allowed = overrides[screenKey];
      if (allowed === undefined) continue;
      await this.userOverrideRepo.upsert(
        { userId, branchId, screenKey, allowed },
        { conflictPaths: ['userId', 'branchId', 'screenKey'] },
      );
    }
    return this.getUserOverrides(userId, branchId);
  }

  /** Get all role permissions for all roles (for SuperAdmin matrix UI). */
  async getAllRolePermissions(): Promise<Record<UserRole, Record<ScreenKey, boolean>>> {
    const roles: UserRole[] = ['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'];
    const out = {} as Record<UserRole, Record<ScreenKey, boolean>>;
    for (const role of roles) {
      out[role] = await this.getRolePermissions(role);
    }
    return out;
  }
}
