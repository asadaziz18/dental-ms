import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    findByBranch(branchId: string): Promise<import("../../database/entities").Supplier[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").Supplier>;
    create(branchId: string, dto: CreateSupplierDto): Promise<import("../../database/entities").Supplier>;
    update(branchId: string, id: string, dto: UpdateSupplierDto): Promise<import("../../database/entities").Supplier>;
    remove(branchId: string, id: string): Promise<void>;
}
