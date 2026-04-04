import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffLeave } from '../../database/entities/staff-leave.entity';
import { User } from '../../database/entities/user.entity';
import { CreateStaffLeaveDto } from './dto/staff-leave.dto';
import { UpdateStaffLeaveDto } from './dto/staff-leave.dto';

@Injectable()
export class StaffLeaveService {
  constructor(
    @InjectRepository(StaffLeave)
    private readonly leaveRepo: Repository<StaffLeave>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByBranch(branchId: string, fromDate?: string, toDate?: string): Promise<StaffLeave[]> {
    const qb = this.leaveRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'user')
      .where('l.branchId = :branchId', { branchId })
      .orderBy('l.fromDate', 'DESC');
    if (fromDate) qb.andWhere('l.toDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('l.fromDate <= :toDate', { toDate });
    return qb.getMany();
  }

  async findByUser(branchId: string, userId: string): Promise<StaffLeave[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.branchId !== branchId) throw new ForbiddenException('User not in this branch');
    return this.leaveRepo.find({
      where: { branchId, userId },
      order: { fromDate: 'DESC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<StaffLeave> {
    const leave = await this.leaveRepo.findOne({
      where: { id, branchId },
      relations: ['user'],
    });
    if (!leave) throw new NotFoundException('Leave record not found');
    return leave;
  }

  async create(branchId: string, dto: CreateStaffLeaveDto): Promise<StaffLeave> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.branchId !== branchId) throw new ForbiddenException('User not in this branch');
    const leave = this.leaveRepo.create({
      userId: dto.userId,
      branchId,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
      type: (dto.type as StaffLeave['type']) ?? 'annual',
      status: 'Pending',
      notes: dto.notes ?? null,
    });
    return this.leaveRepo.save(leave);
  }

  async update(branchId: string, id: string, dto: UpdateStaffLeaveDto): Promise<StaffLeave> {
    const leave = await this.findOne(branchId, id);
    if (dto.status !== undefined) leave.status = dto.status as StaffLeave['status'];
    if (dto.notes !== undefined) leave.notes = dto.notes;
    return this.leaveRepo.save(leave);
  }

  async remove(branchId: string, id: string): Promise<void> {
    await this.findOne(branchId, id);
    await this.leaveRepo.delete(id);
  }
}
