import { BranchesService } from './branches.service';
import { RequestUser } from '../auth/decorators/current-user.decorator';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchStatusDto } from './dto/branch-status.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    createMainBranch(dto: CreateBranchDto): Promise<import("../../database/entities").Branch>;
    createSubBranch(parentId: string, dto: CreateBranchDto): Promise<import("../../database/entities").Branch>;
    remove(id: string): Promise<{
        message: string;
    }>;
    list(user: RequestUser): Promise<import("./branches.service").BranchTreeItem[]>;
    findOne(id: string, user: RequestUser): Promise<import("../../database/entities").Branch>;
    update(id: string, dto: UpdateBranchDto, user: RequestUser): Promise<import("../../database/entities").Branch>;
    updateStatus(id: string, dto: BranchStatusDto, user: RequestUser): Promise<import("../../database/entities").Branch>;
    getStaff(id: string, user: RequestUser): Promise<import("./branches.service").StaffItem[]>;
    getStats(id: string, user: RequestUser): Promise<import("./branches.service").BranchStats>;
    assignManager(id: string, dto: AssignManagerDto): Promise<import("../../database/entities").Branch>;
}
