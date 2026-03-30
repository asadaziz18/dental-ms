import { BaseEntity } from './base.entity';
import { User } from './user.entity';
export declare class RefreshToken extends BaseEntity {
    userId: string;
    user: User;
    tokenHash: string;
    expiresAt: Date;
}
