import { LabVendorsService } from './lab-vendors.service';
import { CreateLabVendorDto } from './dto/create-lab-vendor.dto';
import { UpdateLabVendorDto } from './dto/update-lab-vendor.dto';
import { VendorStatusDto } from './dto/vendor-status.dto';
import { LabVendorQueryDto } from './dto/lab-query.dto';
import { RequestUser } from '../auth/decorators/current-user.decorator';
import { LabOrdersService } from './lab-orders.service';
export declare class LabVendorsController {
    private readonly vendorsService;
    private readonly ordersService;
    constructor(vendorsService: LabVendorsService, ordersService: LabOrdersService);
    private getTenantId;
    findAll(branchId: string, user: RequestUser, query: LabVendorQueryDto): Promise<import("../../database/entities").LabVendor[]>;
    create(branchId: string, _user: RequestUser, dto: CreateLabVendorDto): Promise<import("../../database/entities").LabVendor>;
    findOne(id: string, branchId: string, user: RequestUser): Promise<{
        vendor: import("../../database/entities").LabVendor;
        activeOrdersCount: number;
    }>;
    update(id: string, branchId: string, user: RequestUser, dto: UpdateLabVendorDto): Promise<import("../../database/entities").LabVendor>;
    updateStatus(id: string, branchId: string, user: RequestUser, dto: VendorStatusDto): Promise<import("../../database/entities").LabVendor>;
    remove(id: string, branchId: string, user: RequestUser): Promise<void>;
}
