"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_entity_1 = require("../../database/entities/branch.entity");
const tenant_entity_1 = require("../../database/entities/tenant.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const appointment_entity_1 = require("../../database/entities/appointment.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
const invoice_entity_1 = require("../../database/entities/invoice.entity");
const payment_entity_1 = require("../../database/entities/payment.entity");
const WORKING_DAYS_SET = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
function toNum(s) {
    if (s == null)
        return 0;
    const n = parseFloat(String(s));
    return Number.isFinite(n) ? n : 0;
}
let BranchesService = class BranchesService {
    branchRepo;
    tenantRepo;
    userRepo;
    appointmentRepo;
    patientRepo;
    invoiceRepo;
    paymentRepo;
    constructor(branchRepo, tenantRepo, userRepo, appointmentRepo, patientRepo, invoiceRepo, paymentRepo) {
        this.branchRepo = branchRepo;
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
        this.appointmentRepo = appointmentRepo;
        this.patientRepo = patientRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
    }
    parseTime(t) {
        const [h, m] = t.split(':').map(Number);
        return (h ?? 0) * 60 + (m ?? 0);
    }
    validateWorkingDays(days) {
        if (!Array.isArray(days) || days.length === 0) {
            throw new common_1.BadRequestException('At least one working day must be selected');
        }
        for (const d of days) {
            if (!WORKING_DAYS_SET.has(d)) {
                throw new common_1.BadRequestException(`Invalid working day: ${d}`);
            }
        }
    }
    validateOpeningBeforeClosing(opening, closing) {
        if (this.parseTime(opening) >= this.parseTime(closing)) {
            throw new common_1.BadRequestException('openingTime must be before closingTime');
        }
    }
    async getFirstTenantId() {
        const tenant = await this.tenantRepo.find({ take: 1 });
        if (!tenant[0])
            throw new common_1.BadRequestException('No tenant found. Create a tenant first.');
        return tenant[0].id;
    }
    async getTenantIdForUser(userId, userBranchId) {
        if (!userBranchId)
            return null;
        const branch = await this.branchRepo.findOne({
            where: { id: userBranchId },
            select: ['tenantId'],
        });
        return branch?.tenantId ?? null;
    }
    async createMainBranch(dto) {
        const tenantId = await this.getFirstTenantId();
        const code = dto.code.toUpperCase().trim();
        const existing = await this.branchRepo.findOne({
            where: { tenantId, code },
            withDeleted: true,
        });
        if (existing) {
            throw new common_1.BadRequestException(`Branch code "${code}" already exists for this tenant`);
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
    async createSubBranchWithParent(parentId, dto) {
        const parent = await this.branchRepo.findOne({
            where: { id: parentId },
            select: ['id', 'tenantId', 'parentBranchId'],
        });
        if (!parent) {
            throw new common_1.NotFoundException('Parent branch not found');
        }
        if (parent.parentBranchId != null) {
            throw new common_1.BadRequestException('Cannot create sub-branch under another sub-branch (max 2 levels)');
        }
        const tenantId = parent.tenantId;
        if (tenantId == null) {
            throw new common_1.BadRequestException('Parent branch has no tenant');
        }
        const code = dto.code.toUpperCase().trim();
        const existing = await this.branchRepo.findOne({
            where: { tenantId, code },
            withDeleted: true,
        });
        if (existing) {
            throw new common_1.BadRequestException(`Branch code "${code}" already exists for this tenant`);
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
    async findTree(role, userBranchId) {
        let branches;
        if (role === 'SuperAdmin') {
            branches = await this.branchRepo.find({
                where: { parentBranchId: (0, typeorm_2.IsNull)() },
                relations: ['manager', 'subBranches', 'subBranches.manager'],
                order: { name: 'ASC' },
            });
        }
        else {
            const tenantId = await this.getTenantIdForUser('', userBranchId);
            if (!tenantId)
                return [];
            branches = await this.branchRepo.find({
                where: { tenantId, parentBranchId: (0, typeorm_2.IsNull)() },
                relations: ['manager', 'subBranches', 'subBranches.manager'],
                order: { name: 'ASC' },
            });
        }
        return branches.map((b) => this.toTreeItem(b));
    }
    toTreeItem(b) {
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
    async findOne(id, role, userBranchId) {
        const branch = await this.branchRepo.findOne({
            where: { id },
            relations: ['manager', 'subBranches', 'subBranches.manager', 'tenant'],
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        if (role !== 'SuperAdmin') {
            const tenantId = await this.getTenantIdForUser('', userBranchId);
            if (branch.tenantId !== tenantId) {
                throw new common_1.ForbiddenException('You do not have access to this branch');
            }
        }
        return branch;
    }
    async update(id, dto, role, userBranchId) {
        const branch = await this.findOne(id, role, userBranchId);
        if (role === 'BranchAdmin' && branch.id !== userBranchId) {
            throw new common_1.ForbiddenException('You can only edit your own branch');
        }
        if (dto.workingDays?.length !== undefined) {
            this.validateWorkingDays(dto.workingDays);
        }
        const opening = dto.openingTime ?? branch.openingTime ?? '09:00';
        const closing = dto.closingTime ?? branch.closingTime ?? '18:00';
        this.validateOpeningBeforeClosing(opening, closing);
        if (dto.code !== undefined) {
            const code = dto.code.toUpperCase().trim();
            const where = branch.tenantId != null
                ? { tenantId: branch.tenantId, code }
                : { code };
            const existing = await this.branchRepo.findOne({
                where,
            });
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException(`Branch code "${code}" already exists for this tenant`);
            }
            branch.code = code;
        }
        if (dto.name !== undefined)
            branch.name = dto.name.trim();
        if (dto.address !== undefined)
            branch.address = dto.address.trim();
        if (dto.city !== undefined)
            branch.city = dto.city.trim();
        if (dto.phone !== undefined)
            branch.phone = dto.phone.trim();
        if (dto.email !== undefined)
            branch.email = dto.email?.trim() || null;
        if (dto.openingTime !== undefined)
            branch.openingTime = dto.openingTime;
        if (dto.closingTime !== undefined)
            branch.closingTime = dto.closingTime;
        if (dto.workingDays !== undefined)
            branch.workingDays = dto.workingDays;
        if (dto.isActive !== undefined)
            branch.isActive = dto.isActive;
        if (role === 'SuperAdmin' && dto.managerUserId !== undefined) {
            branch.managerUserId = dto.managerUserId ?? null;
        }
        return this.branchRepo.save(branch);
    }
    async updateStatus(id, dto, role, userBranchId) {
        const branch = await this.findOne(id, role, userBranchId);
        if (role === 'BranchAdmin' && branch.id !== userBranchId) {
            throw new common_1.ForbiddenException('You can only change status of your own branch');
        }
        if (dto.isActive === false) {
            const now = new Date();
            const future = await this.appointmentRepo.count({
                where: { branchId: id, start: (0, typeorm_2.MoreThan)(now) },
            });
            if (future > 0) {
                throw new common_1.BadRequestException('Cannot deactivate a branch with future appointments scheduled');
            }
        }
        branch.isActive = dto.isActive;
        return this.branchRepo.save(branch);
    }
    async remove(id) {
        const branch = await this.branchRepo.findOne({ where: { id } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const now = new Date();
        const qb = this.appointmentRepo.createQueryBuilder('a');
        qb.where('a.branchId = :id', { id }).andWhere('a.start > :now', { now });
        const futureCount = await qb.getCount();
        const usersCount = await this.userRepo.count({ where: { branchId: id } });
        const blockers = [];
        if (futureCount > 0)
            blockers.push(`${futureCount} future appointment(s)`);
        if (usersCount > 0)
            blockers.push(`${usersCount} assigned user(s)`);
        if (blockers.length > 0) {
            throw new common_1.BadRequestException(`Cannot delete branch. Blocked by: ${blockers.join(', ')}`);
        }
        await this.branchRepo.softRemove(branch);
        return { message: 'Branch deleted successfully' };
    }
    async getStaff(id, role, userBranchId) {
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
    async getStats(id, role, userBranchId) {
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
            .getRawOne();
        return {
            totalPatients,
            totalDoctors: doctors,
            totalStaff,
            appointmentsThisMonth: appointmentsThisMonthCount,
            revenueThisMonth: toNum(revenueRows?.total),
        };
    }
    async assignManager(id, dto) {
        const branch = await this.branchRepo.findOne({ where: { id }, relations: ['manager'] });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const user = await this.userRepo.findOne({
            where: { id: dto.userId, role: 'BranchAdmin' },
        });
        if (!user)
            throw new common_1.BadRequestException('User must be a BranchAdmin to be assigned as manager');
        branch.managerUserId = dto.userId;
        return this.branchRepo.save(branch);
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(4, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(5, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(6, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BranchesService);
//# sourceMappingURL=branches.service.js.map