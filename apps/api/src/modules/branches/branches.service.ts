import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
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

const WORKING_DAYS_SET = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

function toNum(s: string | null | undefined): number {
  if (s == null) return 0;
  const n = parseFloat(String(s));
  return Number.isFinite(n) ? n : 0;
}

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  private parseTime(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  }

  private validateWorkingDays(days: string[]) {
    if (!Array.isArray(days) || days.length === 0) {
      throw new BadRequestException('At least one working day must be selected');
    }
    for (const d of days) {
      if (!WORKING_DAYS_SET.has(d)) {
        throw new BadRequestException(`Invalid working day: ${d}`);
      }
    }
  }

  private validateOpeningBeforeClosing(opening: string, closing: string) {
    if (this.parseTime(opening) >= this.parseTime(closing)) {
      throw new BadRequestException('openingTime must be before closingTime');
    }
  }

  async getFirstTenantId(): Promise<string> {
    const tenant = await this.tenantRepo.find({ take: 1 });
    if (!tenant[0]) throw new BadRequestException('No tenant found. Create a tenant first.');
    return tenant[0].id;
  }

  async getTenantIdForUser(userId: string, userBranchId: string | null): Promise<string | null> {
    if (!userBranchId) return null;
    const branch = await this.branchRepo.findOne({
      where: { id: userBranchId },
      select: ['tenantId'],
    });
    return branch?.tenantId ?? null;
  }

  async createMainBranch(dto: CreateBranchDto): Promise<Branch> {
    const tenantId = await this.getFirstTenantId();
    const code = dto.code.toUpperCase().trim();
    const existing = await this.branchRepo.findOne({
      where: { tenantId, code },
      withDeleted: true,
    });
    if (existing) {
      throw new BadRequestException(`Branch code "${code}" already exists for this tenant`);
    }
    this.validateWorkingDays(dto.workingDays);
    this.validateOpeningBeforeClosing(dto.openingTime, dto.closingTime);

    const branch = this.branchRepo.create({
      tenantId,
      parentBranchId: null,
      name: dto.name.trim(),
      code,
      address: dto.address.trim(),
      city: dto.city.trim(),
      phone: dto.phone.trim(),
      email: dto.email?.trim() || null,
      managerUserId: dto.managerUserId ?? null,
      isActive: dto.isActive ?? true,
      openingTime: dto.openingTime,
      closingTime: dto.closingTime,
      workingDays: dto.workingDays,
    });
    return this.branchRepo.save(branch);
  }

  async createSubBranchWithParent(parentId: string, dto: CreateBranchDto): Promise<Branch> {
    const parent = await this.branchRepo.findOne({
      where: { id: parentId },
      select: ['id', 'tenantId', 'parentBranchId'],
    });
    if (!parent) {
      throw new NotFoundException('Parent branch not found');
    }
    if (parent.parentBranchId != null) {
      throw new BadRequestException('Cannot create sub-branch under another sub-branch (max 2 levels)');
    }
    const tenantId = parent.tenantId;
    if (tenantId == null) {
      throw new BadRequestException('Parent branch has no tenant');
    }

    const code = dto.code.toUpperCase().trim();
    const existing = await this.branchRepo.findOne({
      where: { tenantId, code },
      withDeleted: true,
    });
    if (existing) {
      throw new BadRequestException(`Branch code "${code}" already exists for this tenant`);
    }
    this.validateWorkingDays(dto.workingDays);
    this.validateOpeningBeforeClosing(dto.openingTime, dto.closingTime);

    const branch = this.branchRepo.create({
      tenantId,
      parentBranchId: parent.id,
      name: dto.name.trim(),
      code,
      address: dto.address.trim(),
      city: dto.city.trim(),
      phone: dto.phone.trim(),
      email: dto.email?.trim() || null,
      managerUserId: dto.managerUserId ?? null,
      isActive: dto.isActive ?? true,
      openingTime: dto.openingTime,
      closingTime: dto.closingTime,
      workingDays: dto.workingDays,
    });
    return this.branchRepo.save(branch);
  }

  async findTree(role: string, userBranchId: string | null): Promise<BranchTreeItem[]> {
    let branches: Branch[];
    if (role === 'SuperAdmin') {
      branches = await this.branchRepo.find({
        where: { parentBranchId: IsNull() },
        relations: ['manager', 'subBranches', 'subBranches.manager'],
        order: { name: 'ASC' },
      });
    } else {
      const tenantId = await this.getTenantIdForUser('', userBranchId);
      if (!tenantId) return [];
      branches = await this.branchRepo.find({
        where: { tenantId, parentBranchId: IsNull() },
        relations: ['manager', 'subBranches', 'subBranches.manager'],
        order: { name: 'ASC' },
      });
    }

    return branches.map((b) => this.toTreeItem(b));
  }

  private toTreeItem(b: Branch): BranchTreeItem {
    const subBranches = (b.subBranches ?? []).map((s) => this.toTreeItem(s));
    return {
      id: b.id,
      name: b.name,
      code: b.code ?? '',
      city: b.city ?? '',
      isActive: b.isActive,
      manager: b.manager
        ? { id: b.manager.id, fullName: b.manager.fullName, email: b.manager.email }
        : null,
      subBranches,
    };
  }

  async findOne(id: string, role: string, userBranchId: string | null): Promise<Branch> {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['manager', 'subBranches', 'subBranches.manager', 'tenant'],
    });
    if (!branch) throw new NotFoundException('Branch not found');
    if (role !== 'SuperAdmin') {
      const tenantId = await this.getTenantIdForUser('', userBranchId);
      if (branch.tenantId !== tenantId) {
        throw new ForbiddenException('You do not have access to this branch');
      }
    }
    return branch;
  }

  async update(
    id: string,
    dto: UpdateBranchDto,
    role: string,
    userBranchId: string | null,
  ): Promise<Branch> {
    const branch = await this.findOne(id, role, userBranchId);
    if (role === 'BranchAdmin' && branch.id !== userBranchId) {
      throw new ForbiddenException('You can only edit your own branch');
    }

    if (dto.workingDays?.length !== undefined) {
      this.validateWorkingDays(dto.workingDays);
    }
    const opening = dto.openingTime ?? branch.openingTime ?? '09:00';
    const closing = dto.closingTime ?? branch.closingTime ?? '18:00';
    this.validateOpeningBeforeClosing(opening, closing);

    if (dto.code !== undefined) {
      const code = dto.code.toUpperCase().trim();
      const where =
        branch.tenantId != null
          ? { tenantId: branch.tenantId, code }
          : { code };
      const existing = await this.branchRepo.findOne({
        where,
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Branch code "${code}" already exists for this tenant`);
      }
      branch.code = code;
    }
    if (dto.name !== undefined) branch.name = dto.name.trim();
    if (dto.address !== undefined) branch.address = dto.address.trim();
    if (dto.city !== undefined) branch.city = dto.city.trim();
    if (dto.phone !== undefined) branch.phone = dto.phone.trim();
    if (dto.email !== undefined) branch.email = dto.email?.trim() || null;
    if (dto.openingTime !== undefined) branch.openingTime = dto.openingTime;
    if (dto.closingTime !== undefined) branch.closingTime = dto.closingTime;
    if (dto.workingDays !== undefined) branch.workingDays = dto.workingDays;
    if (dto.isActive !== undefined) branch.isActive = dto.isActive;
    if (role === 'SuperAdmin' && dto.managerUserId !== undefined) {
      branch.managerUserId = dto.managerUserId ?? null;
    }
    return this.branchRepo.save(branch);
  }

  async updateStatus(
    id: string,
    dto: BranchStatusDto,
    role: string,
    userBranchId: string | null,
  ): Promise<Branch> {
    const branch = await this.findOne(id, role, userBranchId);
    if (role === 'BranchAdmin' && branch.id !== userBranchId) {
      throw new ForbiddenException('You can only change status of your own branch');
    }
    if (dto.isActive === false) {
      const now = new Date();
      const future = await this.appointmentRepo.count({
        where: { branchId: id, start: MoreThan(now) },
      });
      if (future > 0) {
        throw new BadRequestException(
          'Cannot deactivate a branch with future appointments scheduled',
        );
      }
    }
    branch.isActive = dto.isActive;
    return this.branchRepo.save(branch);
  }

  async remove(id: string): Promise<{ message: string }> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');

    const now = new Date();
    const qb = this.appointmentRepo.createQueryBuilder('a');
    qb.where('a.branchId = :id', { id }).andWhere('a.start > :now', { now });
    const futureCount = await qb.getCount();

    const usersCount = await this.userRepo.count({ where: { branchId: id } });

    const blockers: string[] = [];
    if (futureCount > 0) blockers.push(`${futureCount} future appointment(s)`);
    if (usersCount > 0) blockers.push(`${usersCount} assigned user(s)`);

    if (blockers.length > 0) {
      throw new BadRequestException(
        `Cannot delete branch. Blocked by: ${blockers.join(', ')}`,
      );
    }

    await this.branchRepo.softRemove(branch);
    return { message: 'Branch deleted successfully' };
  }

  async getStaff(id: string, role: string, userBranchId: string | null): Promise<StaffItem[]> {
    await this.findOne(id, role, userBranchId);
    const users = await this.userRepo.find({
      where: { branchId: id },
      select: ['id', 'fullName', 'email', 'role'],
    });
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
    }));
  }

  async getStats(id: string, role: string, userBranchId: string | null): Promise<BranchStats> {
    await this.findOne(id, role, userBranchId);

    const totalPatients = await this.patientRepo.count({ where: { branchId: id } });
    const doctors = await this.userRepo.count({
      where: { branchId: id, role: 'Doctor' },
    });
    const totalStaff = await this.userRepo.count({ where: { branchId: id } });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const apptsQb = this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.branchId = :id', { id })
      .andWhere('a.start >= :monthStart', { monthStart })
      .andWhere('a.start < :monthEnd', { monthEnd });
    const appointmentsThisMonthCount = await apptsQb.getCount();

    const revenueRows = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.invoice', 'i')
      .where('i.branchId = :id', { id })
      .andWhere('p.paidAt >= :monthStart', { monthStart })
      .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'total')
      .getRawOne<{ total: string }>();

    return {
      totalPatients,
      totalDoctors: doctors,
      totalStaff,
      appointmentsThisMonth: appointmentsThisMonthCount,
      revenueThisMonth: toNum(revenueRows?.total),
    };
  }

  async assignManager(id: string, dto: AssignManagerDto): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id }, relations: ['manager'] });
    if (!branch) throw new NotFoundException('Branch not found');
    const user = await this.userRepo.findOne({
      where: { id: dto.userId, role: 'BranchAdmin' },
    });
    if (!user) throw new BadRequestException('User must be a BranchAdmin to be assigned as manager');
    branch.managerUserId = dto.userId;
    return this.branchRepo.save(branch);
  }
}

export interface BranchTreeItem {
  id: string;
  name: string;
  code: string;
  city: string;
  isActive: boolean;
  manager: { id: string; fullName: string; email: string } | null;
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
