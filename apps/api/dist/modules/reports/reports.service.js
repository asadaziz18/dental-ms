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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../../database/entities/appointment.entity");
const invoice_entity_1 = require("../../database/entities/invoice.entity");
const payment_entity_1 = require("../../database/entities/payment.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
const treatment_plan_item_entity_1 = require("../../database/entities/treatment-plan-item.entity");
const invoice_line_item_entity_1 = require("../../database/entities/invoice-line-item.entity");
const procedure_entity_1 = require("../../database/entities/procedure.entity");
const user_entity_1 = require("../../database/entities/user.entity");
function toNum(s) {
    if (s == null)
        return 0;
    const n = parseFloat(String(s));
    return Number.isFinite(n) ? n : 0;
}
function startOfDay(d) {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
}
function endOfDay(d) {
    const x = new Date(d);
    x.setUTCHours(23, 59, 59, 999);
    return x;
}
let ReportsService = class ReportsService {
    appointmentRepo;
    invoiceRepo;
    paymentRepo;
    patientRepo;
    planItemRepo;
    lineItemRepo;
    procedureRepo;
    userRepo;
    constructor(appointmentRepo, invoiceRepo, paymentRepo, patientRepo, planItemRepo, lineItemRepo, procedureRepo, userRepo) {
        this.appointmentRepo = appointmentRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.patientRepo = patientRepo;
        this.planItemRepo = planItemRepo;
        this.lineItemRepo = lineItemRepo;
        this.procedureRepo = procedureRepo;
        this.userRepo = userRepo;
    }
    async getDashboard(branchId, date) {
        const d = date ? new Date(date) : new Date();
        const start = startOfDay(d);
        const end = endOfDay(d);
        const todayAppointments = await this.appointmentRepo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .andWhere('a.start >= :start', { start })
            .andWhere('a.start <= :end', { end })
            .andWhere("a.status NOT IN ('Cancelled')")
            .select('COUNT(a.id)', 'count')
            .getRawOne();
        const revenueToday = await this.paymentRepo
            .createQueryBuilder('p')
            .innerJoin('p.invoice', 'i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere('p.paidAt >= :start', { start })
            .andWhere('p.paidAt <= :end', { end })
            .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'total')
            .getRawOne();
        const newPatientsToday = await this.patientRepo
            .createQueryBuilder('p')
            .where('p.branchId = :branchId', { branchId })
            .andWhere('p.deletedAt IS NULL')
            .andWhere('p.createdAt >= :start', { start })
            .andWhere('p.createdAt <= :end', { end })
            .select('COUNT(p.id)', 'count')
            .getRawOne();
        const pendingQb = this.invoiceRepo
            .createQueryBuilder('i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere("i.status IN ('Sent', 'PartiallyPaid', 'Overdue')");
        const invoices = await pendingQb.getMany();
        let pendingTotal = 0;
        for (const inv of invoices) {
            const paid = await this.paymentRepo
                .createQueryBuilder('p')
                .where('p.invoiceId = :id', { id: inv.id })
                .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'sum')
                .getRawOne();
            pendingTotal += toNum(inv.total) - toNum(paid?.sum ?? '0');
        }
        return {
            todayAppointments: parseInt(String(todayAppointments?.count ?? '0'), 10),
            revenueToday: toNum(revenueToday?.total),
            newPatientsToday: parseInt(String(newPatientsToday?.count ?? '0'), 10),
            pendingPayments: pendingTotal,
            date: d.toISOString().slice(0, 10),
        };
    }
    async getRevenueTrend(branchId, fromDate, toDate, groupBy, doctorId) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const qb = this.paymentRepo
            .createQueryBuilder('p')
            .innerJoin('p.invoice', 'i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere('p.paidAt >= :from', { from })
            .andWhere('p.paidAt <= :to', { to });
        if (doctorId)
            qb.andWhere('i.doctorId = :doctorId', { doctorId });
        const group = groupBy === 'day'
            ? "date_trunc('day', p.paidAt)"
            : groupBy === 'week'
                ? "date_trunc('week', p.paidAt)"
                : "date_trunc('month', p.paidAt)";
        const rows = await qb
            .select(`${group}`, 'period')
            .addSelect('SUM(CAST(p.amount AS DECIMAL))', 'total')
            .groupBy('period')
            .orderBy('period', 'ASC')
            .getRawMany();
        return rows.map((r) => ({
            period: r.period instanceof Date ? r.period.toISOString().slice(0, 10) : String(r.period).slice(0, 10),
            total: toNum(r.total),
        }));
    }
    async getTreatmentDistribution(branchId, fromDate, toDate) {
        const qb = this.lineItemRepo
            .createQueryBuilder('li')
            .innerJoin('li.invoice', 'i')
            .leftJoin('li.procedure', 'proc')
            .where('i.branchId = :branchId', { branchId })
            .andWhere("i.status != 'Cancelled'");
        if (fromDate)
            qb.andWhere('i.createdAt >= :from', { from: new Date(fromDate) });
        if (toDate)
            qb.andWhere('i.createdAt <= :to', { to: new Date(toDate) });
        const rows = await qb
            .select('COALESCE(proc.name, li.description)', 'name')
            .addSelect('COALESCE(proc.code, li.description)', 'code')
            .addSelect('COUNT(li.id)', 'count')
            .addSelect('SUM(CAST(li.lineTotal AS DECIMAL))', 'revenue')
            .groupBy('proc.name')
            .addGroupBy('proc.code')
            .addGroupBy('li.description')
            .orderBy('count', 'DESC')
            .getRawMany();
        return rows.map((r) => ({
            name: r.name || 'Other',
            code: r.code || '',
            count: parseInt(r.count, 10),
            revenue: toNum(r.revenue),
        }));
    }
    async getDoctorPerformance(branchId, fromDate, toDate) {
        const qb = this.invoiceRepo
            .createQueryBuilder('i')
            .leftJoin('i.doctor', 'd')
            .where('i.branchId = :branchId', { branchId })
            .andWhere("i.status != 'Cancelled'");
        if (fromDate)
            qb.andWhere('i.createdAt >= :from', { from: new Date(fromDate) });
        if (toDate)
            qb.andWhere('i.createdAt <= :to', { to: new Date(toDate) });
        const rows = await qb
            .select('d.id', 'doctorId')
            .addSelect('d.fullName', 'doctorName')
            .addSelect('COUNT(i.id)', 'invoicesCount')
            .addSelect('COALESCE(SUM(CAST(i.total AS DECIMAL)), 0)', 'revenue')
            .groupBy('d.id')
            .addGroupBy('d.fullName')
            .getRawMany();
        const procedureCounts = await this.planItemRepo
            .createQueryBuilder('ti')
            .innerJoin('ti.treatmentPlan', 'tp')
            .where('tp.branchId = :branchId', { branchId })
            .andWhere('ti.status = :status', { status: 'Completed' })
            .andWhere('ti.doctorId IS NOT NULL')
            .select('ti.doctorId', 'doctorId')
            .addSelect('COUNT(ti.id)', 'proceduresCount')
            .groupBy('ti.doctorId')
            .getRawMany();
        const procMap = new Map(procedureCounts.map((p) => [p.doctorId, parseInt(p.proceduresCount, 10)]));
        return rows
            .filter((r) => r.doctorId)
            .map((r) => ({
            doctorId: r.doctorId,
            doctorName: r.doctorName || 'Unknown',
            invoicesCount: parseInt(r.invoicesCount, 10),
            proceduresCompleted: procMap.get(r.doctorId) ?? 0,
            revenue: toNum(r.revenue),
        }))
            .sort((a, b) => b.revenue - a.revenue);
    }
    async getNoShowRate(branchId, fromDate, toDate, doctorId) {
        const qb = this.appointmentRepo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .andWhere("a.status IN ('Completed', 'No-Show', 'Cancelled')");
        if (fromDate)
            qb.andWhere('a.start >= :from', { from: new Date(fromDate) });
        if (toDate)
            qb.andWhere('a.start <= :to', { to: new Date(toDate) });
        if (doctorId)
            qb.andWhere('a.doctorId = :doctorId', { doctorId });
        const totalRow = await qb
            .clone()
            .select('COUNT(a.id)', 'count')
            .getRawOne();
        const noShowsRow = await qb
            .clone()
            .andWhere("a.status = 'No-Show'")
            .select('COUNT(a.id)', 'count')
            .getRawOne();
        const totalN = parseInt(String(totalRow?.count ?? '0'), 10);
        const noShowN = parseInt(String(noShowsRow?.count ?? '0'), 10);
        const rate = totalN > 0 ? (noShowN / totalN) * 100 : 0;
        return {
            total: totalN,
            noShows: noShowN,
            noShowRatePercent: Math.round(rate * 100) / 100,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(4, (0, typeorm_1.InjectRepository)(treatment_plan_item_entity_1.TreatmentPlanItem)),
    __param(5, (0, typeorm_1.InjectRepository)(invoice_line_item_entity_1.InvoiceLineItem)),
    __param(6, (0, typeorm_1.InjectRepository)(procedure_entity_1.Procedure)),
    __param(7, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map