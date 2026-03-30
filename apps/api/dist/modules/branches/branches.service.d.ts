import { Repository } from 'typeorm';
import { Branch } from '../../database/entities/branch.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { User } from '../../database/entities/user.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { Patient } from '../../database/entities/patient.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchStatusDto } from './dto/branch-status.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
export declare class BranchesService {
    private readonly branchRepo;
    private readonly tenantRepo;
    private readonly userRepo;
    private readonly appointmentRepo;
    private readonly patientRepo;
    private readonly invoiceRepo;
    private readonly paymentRepo;
    constructor(branchRepo: Repository<Branch>, tenantRepo: Repository<Tenant>, userRepo: Repository<User>, appointmentRepo: Repository<Appointment>, patientRepo: Repository<Patient>, invoiceRepo: Repository<Invoice>, paymentRepo: Repository<Payment>);
    private parseTime;
    private validateWorkingDays;
    private validateOpeningBeforeClosing;
    getFirstTenantId(): Promise<string>;
    getTenantIdForUser(userId: string, userBranchId: string | null): Promise<string | null>;
    createMainBranch(dto: CreateBranchDto): Promise<Branch>;
    createSubBranchWithParent(parentId: string, dto: CreateBranchDto): Promise<Branch>;
    findTree(role: string, userBranchId: string | null): Promise<BranchTreeItem[]>;
    private toTreeItem;
    findOne(id: string, role: string, userBranchId: string | null): Promise<Branch>;
    update(id: string, dto: UpdateBranchDto, role: string, userBranchId: string | null): Promise<Branch>;
    updateStatus(id: string, dto: BranchStatusDto, role: string, userBranchId: string | null): Promise<Branch>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getStaff(id: string, role: string, userBranchId: string | null): Promise<StaffItem[]>;
    getStats(id: string, role: string, userBranchId: string | null): Promise<BranchStats>;
    assignManager(id: string, dto: AssignManagerDto): Promise<Branch>;
}
export interface BranchTreeItem {
    id: string;
    name: string;
    code: string;
    city: string;
    isActive: boolean;
    manager: {
        id: string;
        fullName: string;
        email: string;
    } | null;
    subBranches: BranchTreeItem[];
}
export interface StaffItem {
    id: string;
    fullName: string;
    email: string;
    role: string;
}
export interface BranchStats {
    totalPatients: number;
    totalDoctors: number;
    totalStaff: number;
    appointmentsThisMonth: number;
    revenueThisMonth: number;
}
