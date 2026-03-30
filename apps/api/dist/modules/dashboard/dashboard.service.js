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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const reports_service_1 = require("../reports/reports.service");
const appointments_service_1 = require("../appointments/appointments.service");
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
let DashboardService = class DashboardService {
    appointmentRepo;
    invoiceRepo;
    paymentRepo;
    patientRepo;
    inventoryItemRepo;
    stockLevelRepo;
    branchRepo;
    reportsService;
    appointmentsService;
    constructor(appointmentRepo, invoiceRepo, paymentRepo, patientRepo, inventoryItemRepo, stockLevelRepo, branchRepo, reportsService, appointmentsService) {
        this.appointmentRepo = appointmentRepo;
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
        this.patientRepo = patientRepo;
        this.inventoryItemRepo = inventoryItemRepo;
        this.stockLevelRepo = stockLevelRepo;
        this.branchRepo = branchRepo;
        this.reportsService = reportsService;
        this.appointmentsService = appointmentsService;
    }
    async getSummary(branchId) {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);
        const todayAppts = await this.appointmentRepo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .andWhere('a.start >= :start', { start })
            .andWhere('a.start <= :end', { end })
            .andWhere("a.status NOT IN ('Cancelled', 'No-Show')")
            .select('a.status', 'status')
            .getRawMany();
        const total = todayAppts.length;
        const confirmed = todayAppts.filter((a) => a.status === 'Confirmed').length;
        const pending = total - confirmed;
        const revenueToday = await this.paymentRepo
            .createQueryBuilder('p')
            .innerJoin('p.invoice', 'i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere('p.paidAt >= :start', { start })
            .andWhere('p.paidAt <= :end', { end })
            .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'total')
            .getRawOne();
        const invoicesPaidToday = await this.paymentRepo
            .createQueryBuilder('p')
            .innerJoin('p.invoice', 'i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere('p.paidAt >= :start', { start })
            .andWhere('p.paidAt <= :end', { end })
            .select('COUNT(DISTINCT p.invoiceId)', 'count')
            .getRawOne();
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        const newPatientsThisMonth = await this.patientRepo
            .createQueryBuilder('p')
            .where('p.branchId = :branchId', { branchId })
            .andWhere('p.deletedAt IS NULL')
            .andWhere('p.createdAt >= :start', { start: thisMonthStart })
            .select('COUNT(p.id)', 'count')
            .getRawOne();
        const newPatientsLastMonth = await this.patientRepo
            .createQueryBuilder('p')
            .where('p.branchId = :branchId', { branchId })
            .andWhere('p.deletedAt IS NULL')
            .andWhere('p.createdAt >= :start', { start: lastMonthStart })
            .andWhere('p.createdAt <= :end', { end: lastMonthEnd })
            .select('COUNT(p.id)', 'count')
            .getRawOne();
        const countThis = parseInt(String(newPatientsThisMonth?.count ?? '0'), 10);
        const countLast = parseInt(String(newPatientsLastMonth?.count ?? '0'), 10);
        const vsLastMonth = countThis - countLast;
        const pendingInvoices = await this.invoiceRepo
            .createQueryBuilder('i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere("i.status IN ('Sent', 'PartiallyPaid', 'Overdue')")
            .getMany();
        let pendingTotal = 0;
        let overdueCount = 0;
        const now = new Date();
        for (const inv of pendingInvoices) {
            const paid = await this.paymentRepo
                .createQueryBuilder('p')
                .where('p.invoiceId = :id', { id: inv.id })
                .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'sum')
                .getRawOne();
            pendingTotal += toNum(inv.total) - toNum(paid?.sum ?? '0');
            if (inv.dueDate && new Date(inv.dueDate) < now)
                overdueCount++;
        }
        return {
            todayAppointments: { total, confirmed, pending },
            todayRevenue: {
                amount: toNum(revenueToday?.total),
                invoicesPaid: parseInt(String(invoicesPaidToday?.count ?? '0'), 10),
            },
            newPatientsThisMonth: { count: countThis, vsLastMonth },
            pendingPayments: { totalAmount: pendingTotal, overdueCount },
        };
    }
    async getTodayAppointments(branchId, doctorId) {
        const today = new Date().toISOString().slice(0, 10);
        return this.appointmentsService.findAll(branchId, {
            date: today,
            doctorId,
        });
    }
    async getRevenueChart(branchId, range) {
        const to = new Date();
        const from = new Date();
        let groupBy = 'day';
        if (range === '30d') {
            from.setDate(from.getDate() - 30);
        }
        else {
            from.setMonth(from.getMonth() - 12);
            groupBy = 'month';
        }
        const fromStr = from.toISOString().slice(0, 10);
        const toStr = to.toISOString().slice(0, 10);
        const collected = await this.reportsService.getRevenueTrend(branchId, fromStr, toStr, groupBy);
        const periodExpr = groupBy === 'day'
            ? "date_trunc('day', i.createdAt)"
            : "date_trunc('month', i.createdAt)";
        const invoicedRows = await this.invoiceRepo
            .createQueryBuilder('i')
            .where('i.branchId = :branchId', { branchId })
            .andWhere("i.status != 'Cancelled'")
            .andWhere('i.createdAt >= :from', { from })
            .andWhere('i.createdAt <= :to', { to })
            .select(`${periodExpr}`, 'period')
            .addSelect('COALESCE(SUM(CAST(i.total AS DECIMAL)), 0)', 'total')
            .groupBy('period')
            .orderBy('period', 'ASC')
            .getRawMany();
        const invoicedMap = new Map(invoicedRows.map((r) => {
            const key = r.period instanceof Date
                ? r.period.toISOString().slice(0, 10)
                : String(r.period).slice(0, 10);
            return [key, toNum(r.total)];
        }));
        const collectedMap = new Map(collected.map((c) => [c.period, c.total]));
        const allDates = new Set([...invoicedMap.keys(), ...collectedMap.keys()]);
        const sortedDates = Array.from(allDates).sort();
        return sortedDates.map((date) => ({
            date,
            invoiced: invoicedMap.get(date) ?? 0,
            collected: collectedMap.get(date) ?? 0,
        }));
    }
    async getUpcomingAppointments(branchId, days, doctorId) {
        const from = new Date();
        const to = new Date();
        to.setDate(to.getDate() + days);
        const list = await this.appointmentRepo
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.patient', 'patient')
            .leftJoinAndSelect('a.doctor', 'doctor')
            .where('a.branchId = :branchId', { branchId })
            .andWhere('a.start >= :from', { from })
            .andWhere('a.start <= :to', { to })
            .andWhere("a.status NOT IN ('Cancelled')");
        if (doctorId) {
            list.andWhere('a.doctorId = :doctorId', { doctorId });
        }
        const result = await list.orderBy('a.start', 'ASC').take(10).getMany();
        return result;
    }
    async getLowStock(branchId) {
        const levels = await this.stockLevelRepo
            .createQueryBuilder('sl')
            .innerJoinAndSelect('sl.item', 'item')
            .where('sl.branchId = :branchId', { branchId })
            .andWhere('sl.quantity < item.reorderThreshold')
            .getMany();
        return levels.map((sl) => ({
            itemId: sl.itemId,
            name: sl.item.name,
            sku: sl.item.sku,
            currentQuantity: sl.quantity,
            reorderThreshold: sl.item.reorderThreshold,
            branchId: sl.branchId,
        }));
    }
    async getDoctorPerformance(branchId, month) {
        const d = month ? new Date(month) : new Date();
        const from = new Date(d.getFullYear(), d.getMonth(), 1);
        const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const fromStr = from.toISOString().slice(0, 10);
        const toStr = to.toISOString().slice(0, 10);
        const perf = await this.reportsService.getDoctorPerformance(branchId, fromStr, toStr);
        const patientsSeenByDoctor = await this.appointmentRepo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .andWhere('a.doctorId IS NOT NULL')
            .andWhere('a.start >= :from', { from })
            .andWhere('a.start <= :to', { to })
            .andWhere("a.status IN ('Completed', 'In Progress')")
            .select('a.doctorId', 'doctorId')
            .addSelect('COUNT(DISTINCT a.patientId)', 'patientsSeen')
            .groupBy('a.doctorId')
            .getRawMany();
        const seenMap = new Map(patientsSeenByDoctor.map((r) => [r.doctorId, parseInt(r.patientsSeen, 10)]));
        return perf.map((p) => ({
            doctorId: p.doctorId,
            name: p.doctorName,
            patientsSeen: seenMap.get(p.doctorId) ?? 0,
            proceduresDone: p.proceduresCompleted,
            revenue: p.revenue,
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Invoice)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Patient)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.InventoryItem)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.StockLevel)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Branch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        reports_service_1.ReportsService,
        appointments_service_1.AppointmentsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map