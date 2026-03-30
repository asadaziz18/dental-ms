import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import type { UserRole } from '../../database/entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async getBranchIdsForList(currentUserRole: UserRole, branchId: string | null, allowedBranches: string[]): Promise<string[]> {
    if (currentUserRole === 'SuperAdmin') return []; // all branches
    if (branchId) return [branchId];
    return allowedBranches ?? [];
  }

  async findAll(
    currentUserRole: UserRole,
    branchId: string | null,
    allowedBranches: string[],
    branchIdFilter?: string,
  ): Promise<User[]> {
    const branchIds = await this.getBranchIdsForList(currentUserRole, branchId, allowedBranches);
    const qb = this.userRepo.createQueryBuilder('user').orderBy('user.fullName', 'ASC');
    if (currentUserRole !== 'SuperAdmin') {
      if (!branchIds.length) return [];
      qb.andWhere('user.branchId IN (:...ids)', { ids: branchIds });
    }
    if (branchIdFilter) qb.andWhere('user.branchId = :branchIdFilter', { branchIdFilter });
    return qb.getMany();
  }

  async findOne(
    currentUserRole: UserRole,
    branchId: string | null,
    allowedBranches: string[],
    id: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['branch'] });
    if (!user) throw new NotFoundException('Staff not found');
    if (currentUserRole !== 'SuperAdmin') {
      const branchIds = await this.getBranchIdsForList(currentUserRole, branchId, allowedBranches);
      if (!user.branchId || !branchIds.includes(user.branchId)) throw new ForbiddenException('Access denied');
    }
    return user;
  }

  async create(
    currentUserRole: UserRole,
    branchId: string | null,
    dto: CreateStaffDto,
  ): Promise<User> {
    if (currentUserRole !== 'SuperAdmin' && currentUserRole !== 'BranchAdmin')
      throw new ForbiddenException('Only admins can create staff');
    if (currentUserRole === 'BranchAdmin' && !branchId)
      throw new BadRequestException('Branch context required');
    const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new BadRequestException('Email already registered');
    const assignBranchId = currentUserRole === 'SuperAdmin' ? dto.branchId ?? null : branchId;
    if (dto.role === 'BranchAdmin' || dto.role === 'Doctor' || dto.role === 'Receptionist' || dto.role === 'Nurse') {
      if (!assignBranchId) throw new BadRequestException('Branch required for this role');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
      role: dto.role as UserRole,
      branchId: assignBranchId,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.userRepo.save(user);
    return this.userRepo.findOneOrFail({ where: { id: saved.id }, relations: ['branch'] });
  }

  async update(
    currentUserRole: UserRole,
    branchId: string | null,
    allowedBranches: string[],
    id: string,
    dto: UpdateStaffDto,
  ): Promise<User> {
    const user = await this.findOne(currentUserRole, branchId, allowedBranches, id);
    if (currentUserRole !== 'SuperAdmin' && currentUserRole !== 'BranchAdmin')
      throw new ForbiddenException('Only admins can update staff');
    if (dto.email !== undefined) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
      if (existing && existing.id !== id) throw new BadRequestException('Email already in use');
      user.email = dto.email.toLowerCase();
    }
    if (dto.password !== undefined) user.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.role !== undefined) user.role = dto.role as UserRole;
    if (dto.branchId !== undefined) {
      if (currentUserRole === 'BranchAdmin') throw new ForbiddenException('Cannot change branch');
      user.branchId = dto.branchId;
    }
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    await this.userRepo.save(user);
    return this.userRepo.findOneOrFail({ where: { id }, relations: ['branch'] });
  }

  async remove(
    currentUserRole: UserRole,
    branchId: string | null,
    allowedBranches: string[],
    id: string,
  ): Promise<void> {
    await this.findOne(currentUserRole, branchId, allowedBranches, id);
    if (currentUserRole !== 'SuperAdmin' && currentUserRole !== 'BranchAdmin')
      throw new ForbiddenException('Only admins can remove staff');
    await this.userRepo.delete(id);
  }
}
