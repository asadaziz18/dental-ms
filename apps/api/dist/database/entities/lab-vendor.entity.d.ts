import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
export declare class LabVendor extends BaseEntity {
    tenantId: string;
    tenant: Tenant;
    name: string;
    contactPerson: string;
    phone: string;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    city: string;
    specializations: string[];
    isActive: boolean;
    notes: string | null;
}
