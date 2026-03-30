import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { UserRole } from './user.entity';
import type { ScreenKey } from '@dental-ms/shared-types';

/**
 * Default screen access per role. Set by SuperAdmin.
 * If no row exists for a role+screen, fall back to default matrix (see PermissionsService).
 */
@Entity('role_screen_permissions')
@Unique(['role', 'screenKey'])
export class RoleScreenPermission extends BaseEntity {
  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @Column({ type: 'varchar', length: 50 })
  screenKey!: ScreenKey;

  @Column({ type: 'boolean', default: true })
  allowed!: boolean;
}
