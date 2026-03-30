import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  Invoice,
  Payment,
  Patient,
  InventoryItem,
  StockLevel,
  Branch,
} from '../../database/entities';
import { ReportsService } from '../reports/reports.service';
import { AppointmentsService } from '../appointments/appointments.service';

function toNum(s: string | null | undefined): number {
  if (s == null) return 0;
  const n = parseFloat(String(s));
  return Number.isFinite(n) ? n : 0;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(InventoryItem)
    private readonly inventoryItemRepo: Repository<InventoryItem>,
    @InjectRepository(StockLevel)
    private readonly stockLevelRepo: Repository<StockLevel>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly reportsService: ReportsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async getSummary(branchId: string) {
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
      .getRawMany<{ status: string }>();

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
      .getRawOne<{ total: string }>();

    const invoicesPaidToday = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.invoice', 'i')
      .where('i.branchId = :branchId', { branchId })
      .andWhere('p.paidAt >= :start', { start })
      .andWhere('p.paidAt <= :end', { end })
      .select('COUNT(DISTINCT p.invoiceId)', 'count')
      .getRawOne<{ count: string }>();

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const newPatientsThisMonth = await this.patientRepo
      .createQueryBuilder('p')
      .where('p.branchId = :branchId', { branchId })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('p.createdAt >= :start', { start: thisMonthStart })
      .select('COUNT(p.id)', 'count')
      .getRawOne<{ count: string }>();

    const newPatientsLastMonth = await this.patientRepo
      .createQueryBuilder('p')
      .where('p.branchId = :branchId', { branchId })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('p.createdAt >= :start', { start: lastMonthStart })
      .andWhere('p.createdAt <= :end', { end: lastMonthEnd })
      .select('COUNT(p.id)', 'count')
      .getRawOne<{ count: string }>();

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
        .getRawOne<{ sum: string }>();
      pendingTotal += toNum(inv.total) - toNum(paid?.sum ?? '0');
      if (inv.dueDate && new Date(inv.dueDate) < now) overdueCount++;
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

  async getTodayAppointments(branchId: string, doctorId?: string) {
    const today = new Date().toISOString().slice(0, 10);
    return this.appointmentsService.findAll(branchId, {
      date: today,
      doctorId,
    });
  }

  async getRevenueChart(branchId: string, range: '30d' | '12m') {
    const to = new Date();
    const from = new Date();
    let groupBy: 'day' | 'month' = 'day';
    if (range === '30d') {
      from.setDate(from.getDate() - 30);
    } else {
      from.setMonth(from.getMonth() - 12);
      groupBy = 'month';
    }
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);

    const collected = await this.reportsService.getRevenueTrend(
      branchId,
      fromStr,
      toStr,
      groupBy,
    );

    const periodExpr =
      groupBy === 'day'
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
      .getRawMany<{ period: Date; total: string }>();

    const invoicedMap = new Map(
      invoicedRows.map((r) => {
        const key =
          r.period instanceof Date
            ? r.period.toISOString().slice(0, 10)
            : String(r.period).slice(0, 10);
        return [key, toNum(r.total)];
      }),
    );

    const collectedMap = new Map(collected.map((c) => [c.period, c.total]));
    const allDates = new Set([...invoicedMap.keys(), ...collectedMap.keys()]);
    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => ({
      date,
      invoiced: invoicedMap.get(date) ?? 0,
      collected: collectedMap.get(date) ?? 0,
    }));
  }

  async getUpcomingAppointments(branchId: string, days: number, doctorId?: string) {
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

  async getLowStock(branchId: string) {
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

  async getDoctorPerformance(branchId: string, month?: string) {
    const d = month ? new Date(month) : new Date();
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    const perf = await this.reportsService.getDoctorPerformance(
      branchId,
      fromStr,
      toStr,
    );

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
      .getRawMany<{ doctorId: string; patientsSeen: string }>();

    const seenMap = new Map(
      patientsSeenByDoctor.map((r) => [r.doctorId, parseInt(r.patientsSeen, 10)]),
    );

    return perf.map((p) => ({
      doctorId: p.doctorId,
      name: p.doctorName,
      patientsSeen: seenMap.get(p.doctorId) ?? 0,
      proceduresDone: p.proceduresCompleted,
      revenue: p.revenue,
    }));
  }
}
