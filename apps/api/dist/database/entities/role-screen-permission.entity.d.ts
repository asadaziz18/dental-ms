import { BaseEntity } from './base.entity';
import type { UserRole } from './user.entity';
import type { ScreenKey } from '@dental-ms/shared-types';
export declare class RoleScreenPermission extends BaseEntity {
    role: UserRole;
    screenKey: ScreenKey;
    allowed: boolean;
}
