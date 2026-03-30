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
exports.DoctorCommissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const doctor_commission_rate_entity_1 = require("../../database/entities/doctor-commission-rate.entity");
const invoice_entity_1 = require("../../database/entities/invoice.entity");
const user_entity_1 = require("../../database/entities/user.entity");
function toNum(s) {
    return parseFloat(s) || 0;
}
let DoctorCommissionService = class DoctorCommissionService {
    rateRepo;
    invoiceRepo;
    userRepo;
    constructor(rateRepo, invoiceRepo, userRepo) {
        this.rateRepo = rateRepo;
        this.invoiceRepo = invoiceRepo;
        this.userRepo = userRepo;
    }
    async getRate(branchId, doctorId) {
        const user = await this.userRepo.findOne({ where: { id: doctorId } });
        if (!user)
            throw new common_1.NotFoundException('Doctor not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('Doctor not in this branch');
        return this.rateRepo.findOne({ where: { branchId, doctorId }, relations: ['doctor'] });
    }
    async setRate(branchId, doctorId, dto) {
        const user = await this.userRepo.findOne({ where: { id: doctorId } });
        if (!user)
            throw new common_1.NotFoundException('Doctor not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('Doctor not in this branch');
        let rate = await this.rateRepo.findOne({ where: { branchId, doctorId } });
        if (!rate) {
            rate = this.rateRepo.create({ branchId, doctorId, ratePercent: String(dto.ratePercent) });
        }
        else {
            rate.ratePercent = String(dto.ratePercent);
        }
        await this.rateRepo.save(rate);
        return this.rateRepo.findOneOrFail({ where: { id: rate.id }, relations: ['doctor'] });
    }
    async getCommissionSummary(branchId, doctorId, fromDate, toDate) {
        const qb = this.invoiceRepo
            .createQueryBuilder('inv')
            .where('inv.branchId = :branchId', { branchId })
            .andWhere('inv.doctorId IS NOT NULL')
            .andWhere('inv.status != :cancelled', { cancelled: 'Cancelled' });
        if (doctorId)
            qb.andWhere('inv.doctorId = :doctorId', { doctorId });
        if (fromDate)
            qb.andWhere('inv.createdAt >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('inv.createdAt <= :toDate', { toDate });
        const invoices = await qb.getMany();
        const byDoctor = new Map();
        for (const inv of invoices) {
            const did = inv.doctorId;
            const cur = byDoctor.get(did) ?? { total: 0 };
            cur.total += toNum(inv.total);
            byDoctor.set(did, cur);
        }
        const rates = await this.rateRepo.find({
            where: { branchId, ...(doctorId ? { doctorId } : {}) },
            relations: ['doctor'],
        });
        const result = [];
        for (const [did, data] of byDoctor) {
            const rateRow = rates.find((r) => r.doctorId === did);
            const ratePercent = rateRow ? toNum(rateRow.ratePercent) : 0;
            const doctor = rateRow?.doctor ?? (await this.userRepo.findOne({ where: { id: did } }));
            result.push({
                doctorId: did,
                doctorName: doctor?.fullName ?? did,
                totalRevenue: data.total,
                ratePercent,
                commission: (data.total * ratePercent) / 100,
            });
        }
        return result;
    }
};
exports.DoctorCommissionService = DoctorCommissionService;
exports.DoctorCommissionService = DoctorCommissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doctor_commission_rate_entity_1.DoctorCommissionRate)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DoctorCommissionService);
//# sourceMappingURL=doctor-commission.service.js.map