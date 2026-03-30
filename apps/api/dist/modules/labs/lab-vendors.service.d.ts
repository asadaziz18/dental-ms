import { Repository } from 'typeorm';
import { LabVendor } from '../../database/entities/lab-vendor.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { CreateLabVendorDto } from './dto/create-lab-vendor.dto';
import { UpdateLabVendorDto } from './dto/update-lab-vendor.dto';
import { LabVendorQueryDto } from './dto/lab-query.dto';
export declare class LabVendorsService {
    private readonly vendorRepo;
    private readonly orderRepo;
    constructor(vendorRepo: Repository<LabVendor>, orderRepo: Repository<LabOrder>);
    findAll(tenantId: string | null, query: LabVendorQueryDto): Promise<LabVendor[]>;
    findOne(id: string, tenantId: string | null): Promise<LabVendor>;
    findOneWithOrderSummary(id: string, tenantId: string | null): Promise<{
        vendor: LabVendor;
        activeOrdersCount: number;
    }>;
    create(tenantId: string, dto: CreateLabVendorDto): Promise<LabVendor>;
    update(id: string, tenantId: string | null, dto: UpdateLabVendorDto): Promise<LabVendor>;
    updateStatus(id: string, tenantId: string | null, isActive: boolean): Promise<LabVendor>;
    remove(id: string, tenantId: string | null): Promise<void>;
}
