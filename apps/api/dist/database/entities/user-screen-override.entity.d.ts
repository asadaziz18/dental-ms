import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Branch } from './branch.entity';
import type { ScreenKey } from '@dental-ms/shared-types';
export declare class UserScreenOverride extends BaseEntity {
    userId: string;
    user: User;
    branchId: string;
    branch: Branch;
    screenKey: ScreenKey;
    allowed: boolean;
}
