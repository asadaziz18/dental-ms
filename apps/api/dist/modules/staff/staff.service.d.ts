import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import type { UserRole } from '../../database/entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    private getBranchIdsForList;
    findAll(currentUserRole: UserRole, branchId: string | null, allowedBranches: string[], branchIdFilter?: string): Promise<User[]>;
    findOne(currentUserRole: UserRole, branchId: string | null, allowedBranches: string[], id: string): Promise<User>;
    create(currentUserRole: UserRole, branchId: string | null, dto: CreateStaffDto): Promise<User>;
    update(currentUserRole: UserRole, branchId: string | null, allowedBranches: string[], id: string, dto: UpdateStaffDto): Promise<User>;
    remove(currentUserRole: UserRole, branchId: string | null, allowedBranches: string[], id: string): Promise<void>;
}
