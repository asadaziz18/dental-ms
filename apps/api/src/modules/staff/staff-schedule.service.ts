import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffSchedule } from '../../database/entities/staff-schedule.entity';
import { User } from '../../database/entities/user.entity';
import type { UserRole } from '../../database/entities/user.entity';
import { UpsertStaffScheduleDto } from './dto/staff-schedule.dto';

@Injectable()
export class StaffScheduleService {
  constructor(
    @InjectRepository(StaffSchedule)
    private readonly scheduleRepo: Repository<StaffSchedule>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getByUser(branchId: string, userId: string): Promise<StaffSchedule[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.branchId !== branchId) throw new ForbiddenException('User not in this branch');
    return this.scheduleRepo.find({
      where: { branchId, userId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async setSchedule(
    branchId: string,
    userId: string,
    slots: UpsertStaffScheduleDto[],
  ): Promise<StaffSchedule[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.branchId !== branchId) throw new ForbiddenException('User not in this branch');
    await this.scheduleRepo.delete({ branchId, userId });
    const created = slots.map((s) =>
      this.scheduleRepo.create({
        branchId,
        userId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }),
    );
    await this.scheduleRepo.save(created);
    return this.scheduleRepo.find({ where: { branchId, userId }, order: { dayOfWeek: 'ASC' } });
  }
}
