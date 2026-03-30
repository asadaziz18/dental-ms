import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Patient } from '../../database/entities/patient.entity';
import { TreatmentPlanItem } from '../../database/entities/treatment-plan-item.entity';
import { InvoiceLineItem } from '../../database/entities/invoice-line-item.entity';
import { Procedure } from '../../database/entities/procedure.entity';
import { User } from '../../database/entities/user.entity';

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
export class ReportsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(TreatmentPlanItem)
    private readonly planItemRepo: Repository<TreatmentPlanItem>,
    @InjectRepository(InvoiceLineItem)
    private readonly lineItemRepo: Repository<InvoiceLineItem>,
    @InjectRepository(Procedure)
    private readonly procedureRepo: Repository<Procedure>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getDashboard(branchId: string, date?: string  ) {
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
      .getRawOne<{ count: string }>();

    const revenueToday = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.invoice', 'i')
      .where('i.branchId = :branchId', { branchId })
      .andWhere('p.paidAt >= :start', { start })
      .andWhere('p.paidAt <= :end', { end })
      .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'total')
      .getRawOne<{ total: string }>();

    const newPatientsToday = await this.patientRepo
      .createQueryBuilder('p')
      .where('p.branchId = :branchId', { branchId })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('p.createdAt >= :start', { start })
      .andWhere('p.createdAt <= :end', { end })
      .select('COUNT(p.id)', 'count')
      .getRawOne<{ count: string }>();

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
        .getRawOne<{ sum: string }>();
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

  async getRevenueTrend(
    branchId: string,
    fromDate: string,
    toDate: string,
    groupBy: 'day' | 'week' | 'month',
    doctorId?: string,
  ) {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.invoice', 'i')
      .where('i.branchId = :branchId', { branchId })
      .andWhere('p.paidAt >= :from', { from })
      .andWhere('p.paidAt <= :to', { to });
    if (doctorId) qb.andWhere('i.doctorId = :doctorId', { doctorId });

    const group =
      groupBy === 'day'
        ? "date_trunc('day', p.paidAt)"
        : groupBy === 'week'
          ? "date_trunc('week', p.paidAt)"
          : "date_trunc('month', p.paidAt)";

    const rows = await qb
      .select(`${group}`, 'period')
      .addSelect('SUM(CAST(p.amount AS DECIMAL))', 'total')
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany<{ period: Date; total: string }>();

    return rows.map((r) => ({
      period: r.period instanceof Date ? r.period.toISOString().slice(0, 10) : String(r.period).slice(0, 10),
      total: toNum(r.total),
    }));
  }

  async getTreatmentDistribution(branchId: string, fromDate?: string, toDate?: string) {
    const qb = this.lineItemRepo
      .createQueryBuilder('li')
      .innerJoin('li.invoice', 'i')
      .leftJoin('li.procedure', 'proc')
      .where('i.branchId = :branchId', { branchId })
      .andWhere("i.status != 'Cancelled'");
    if (fromDate) qb.andWhere('i.createdAt >= :from', { from: new Date(fromDate) });
    if (toDate) qb.andWhere('i.createdAt <= :to', { to: new Date(toDate) });

    const rows = await qb
      .select('COALESCE(proc.name, li.description)', 'name')
      .addSelect('COALESCE(proc.code, li.description)', 'code')
      .addSelect('COUNT(li.id)', 'count')
      .addSelect('SUM(CAST(li.lineTotal AS DECIMAL))', 'revenue')
      .groupBy('proc.name')
      .addGroupBy('proc.code')
      .addGroupBy('li.description')
      .orderBy('count', 'DESC')
      .getRawMany<{ name: string; code: string; count: string; revenue: string }>();

    return rows.map((r) => ({
      name: r.name || 'Other',
      code: r.code || '',
      count: parseInt(r.count, 10),
      revenue: toNum(r.revenue),
    }));
  }

  async getDoctorPerformance(branchId: string, fromDate?: string, toDate?: string) {
    const qb = this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoin('i.doctor', 'd')
      .where('i.branchId = :branchId', { branchId })
      .andWhere("i.status != 'Cancelled'");
    if (fromDate) qb.andWhere('i.createdAt >= :from', { from: new Date(fromDate) });
    if (toDate) qb.andWhere('i.createdAt <= :to', { to: new Date(toDate) });

    const rows = await qb
      .select('d.id', 'doctorId')
      .addSelect('d.fullName', 'doctorName')
      .addSelect('COUNT(i.id)', 'invoicesCount')
      .addSelect('COALESCE(SUM(CAST(i.total AS DECIMAL)), 0)', 'revenue')
      .groupBy('d.id')
      .addGroupBy('d.fullName')
      .getRawMany<{ doctorId: string | null; doctorName: string | null; invoicesCount: string; revenue: string }>();

    const procedureCounts = await this.planItemRepo
      .createQueryBuilder('ti')
      .innerJoin('ti.treatmentPlan', 'tp')
      .where('tp.branchId = :branchId', { branchId })
      .andWhere('ti.status = :status', { status: 'Completed' })
      .andWhere('ti.doctorId IS NOT NULL')
      .select('ti.doctorId', 'doctorId')
      .addSelect('COUNT(ti.id)', 'proceduresCount')
      .groupBy('ti.doctorId')
      .getRawMany<{ doctorId: string; proceduresCount: string }>();

    const procMap = new Map(procedureCounts.map((p) => [p.doctorId, parseInt(p.proceduresCount, 10)]));

    return rows
      .filter((r) => r.doctorId)
      .map((r) => ({
        doctorId: r.doctorId!,
        doctorName: r.doctorName || 'Unknown',
        invoicesCount: parseInt(r.invoicesCount, 10),
        proceduresCompleted: procMap.get(r.doctorId!) ?? 0,
        revenue: toNum(r.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  async getNoShowRate(branchId: string, fromDate?: string, toDate?: string, doctorId?: string) {
    const qb = this.appointmentRepo
      .createQueryBuilder('a')
      .where('a.branchId = :branchId', { branchId })
      .andWhere("a.status IN ('Completed', 'No-Show', 'Cancelled')");
    if (fromDate) qb.andWhere('a.start >= :from', { from: new Date(fromDate) });
    if (toDate) qb.andWhere('a.start <= :to', { to: new Date(toDate) });
    if (doctorId) qb.andWhere('a.doctorId = :doctorId', { doctorId });

    const totalRow = await qb
      .clone()
      .select('COUNT(a.id)', 'count')
      .getRawOne<{ count: string }>();

    const noShowsRow = await qb
      .clone()
      .andWhere("a.status = 'No-Show'")
      .select('COUNT(a.id)', 'count')
      .getRawOne<{ count: string }>();

    const totalN = parseInt(String(totalRow?.count ?? '0'), 10);
    const noShowN = parseInt(String(noShowsRow?.count ?? '0'), 10);
    const rate = totalN > 0 ? (noShowN / totalN) * 100 : 0;

    return {
      total: totalN,
      noShows: noShowN,
      noShowRatePercent: Math.round(rate * 100) / 100,
    };
  }
}
