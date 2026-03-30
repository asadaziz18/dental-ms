import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
export declare class Branch extends BaseEntity {
    tenantId: string | null;
    tenant: Tenant;
    parentBranchId: string | null;
    parentBranch: Branch | null;
    subBranches: Branch[];
    name: string;
    code: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    managerUserId: string | null;
    manager: User | null;
    isActive: boolean;
    openingTime: string | null;
    closingTime: string | null;
    workingDays: string[] | null;
    deletedAt: Date | null;
}
