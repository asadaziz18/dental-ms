import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffAttendance } from '../../database/entities/staff-attendance.entity';
import { User } from '../../database/entities/user.entity';
import { CreateOrUpdateAttendanceDto } from './dto/staff-attendance.dto';

@Injectable()
export class StaffAttendanceService {
  constructor(
    @InjectRepository(StaffAttendance)
    private readonly attendanceRepo: Repository<StaffAttendance>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getByBranch(branchId: string, fromDate?: string, toDate?: string): Promise<StaffAttendance[]> {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.branchId = :branchId', { branchId })
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.userId', 'ASC');
    if (fromDate) qb.andWhere('a.date >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('a.date <= :toDate', { toDate });
    return qb.getMany();
  }

  async getByUser(branchId: string, userId: string, fromDate?: string, toDate?: string): Promise<StaffAttendance[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.branchId !== branchId) throw new ForbiddenException('User not in this branch');
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.branchId = :branchId', { branchId })
      .andWhere('a.userId = :userId', { userId })
      .orderBy('a.date', 'DESC');
    if (fromDate) qb.andWhere('a.date >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('a.date <= :toDate', { toDate });
    return qb.getMany();
  }

  async upsert(branchId: string, userId: string, dto: CreateOrUpdateAttendanceDto): Promise<StaffAttendance> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.branchId !== branchId) throw new ForbiddenException('User not in this branch');
    let record = await this.attendanceRepo.findOne({
      where: { branchId, userId, date: dto.date },
    });
    if (!record) {
      record = this.attendanceRepo.create({
        branchId,
        userId,
        date: dto.date,
        checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : null,
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : null,
      });
    } else {
      if (dto.checkInAt !== undefined) record.checkInAt = dto.checkInAt ? new Date(dto.checkInAt) : null;
      if (dto.checkOutAt !== undefined) record.checkOutAt = dto.checkOutAt ? new Date(dto.checkOutAt) : null;
    }
    return this.attendanceRepo.save(record);
  }
}
