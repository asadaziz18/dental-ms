import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RequestUser } from '../auth/decorators/current-user.decorator';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    findAll(user: RequestUser, branchId: string, branchIdFilter?: string): Promise<import("../../database/entities").User[]>;
    findOne(user: RequestUser, branchId: string, id: string): Promise<import("../../database/entities").User>;
    create(user: RequestUser, branchId: string, dto: CreateStaffDto): Promise<import("../../database/entities").User>;
    update(user: RequestUser, branchId: string, id: string, dto: UpdateStaffDto): Promise<import("../../database/entities").User>;
    remove(user: RequestUser, branchId: string, id: string): Promise<void>;
}
