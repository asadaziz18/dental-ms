import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorCommissionRate } from '../../database/entities/doctor-commission-rate.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { User } from '../../database/entities/user.entity';
import { SetCommissionRateDto } from './dto/doctor-commission.dto';

function toNum(s: string): number {
  return parseFloat(s) || 0;
}

@Injectable()
export class DoctorCommissionService {
  constructor(
    @InjectRepository(DoctorCommissionRate)
    private readonly rateRepo: Repository<DoctorCommissionRate>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getRate(branchId: string, doctorId: string): Promise<DoctorCommissionRate | null> {
    const user = await this.userRepo.findOne({ where: { id: doctorId } });
    if (!user) throw new NotFoundException('Doctor not found');
    if (user.branchId !== branchId) throw new ForbiddenException('Doctor not in this branch');
    return this.rateRepo.findOne({ where: { branchId, doctorId }, relations: ['doctor'] });
  }

  async setRate(branchId: string, doctorId: string, dto: SetCommissionRateDto): Promise<DoctorCommissionRate> {
    const user = await this.userRepo.findOne({ where: { id: doctorId } });
    if (!user) throw new NotFoundException('Doctor not found');
    if (user.branchId !== branchId) throw new ForbiddenException('Doctor not in this branch');
    let rate = await this.rateRepo.findOne({ where: { branchId, doctorId } });
    if (!rate) {
      rate = this.rateRepo.create({ branchId, doctorId, ratePercent: String(dto.ratePercent) });
    } else {
      rate.ratePercent = String(dto.ratePercent);
    }
    await this.rateRepo.save(rate);
    return this.rateRepo.findOneOrFail({ where: { id: rate.id }, relations: ['doctor'] });
  }

  async getCommissionSummary(branchId: string, doctorId?: string, fromDate?: string, toDate?: string): Promise<{ doctorId: string; doctorName: string; totalRevenue: number; ratePercent: number; commission: number }[]> {
    const qb = this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.branchId = :branchId', { branchId })
      .andWhere('inv.doctorId IS NOT NULL')
      .andWhere('inv.status != :cancelled', { cancelled: 'Cancelled' });
    if (doctorId) qb.andWhere('inv.doctorId = :doctorId', { doctorId });
    if (fromDate) qb.andWhere('inv.createdAt >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('inv.createdAt <= :toDate', { toDate });
    const invoices = await qb.getMany();
    const byDoctor = new Map<string, { total: number }>();
    for (const inv of invoices) {
      const did = inv.doctorId!;
      const cur = byDoctor.get(did) ?? { total: 0 };
      cur.total += toNum(inv.total);
      byDoctor.set(did, cur);
    }
    const rates = await this.rateRepo.find({
      where: { branchId, ...(doctorId ? { doctorId } : {}) },
      relations: ['doctor'],
    });
    const result: { doctorId: string; doctorName: string; totalRevenue: number; ratePercent: number; commission: number }[] = [];
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
}
