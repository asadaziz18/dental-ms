import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import { Patient } from '../../database/entities/patient.entity';
import { User } from '../../database/entities/user.entity';
import type { PlanFeatures } from '../../database/entities/subscription-plan.entity';

const ALLOWED_STATUSES = ['active', 'trialing'] as const;

export interface PlanLimitUsage {
  planId: string;
  planName: string;
  features: PlanFeatures | null;
  limits: {
    maxPatients: number;
    maxStaff: number;
    maxBranches: number;
    imaging: boolean;
    reports: boolean;
    inventory: boolean;
  };
  usage: {
    patients: number;
    staff: number;
    branches: number;
  };
  canAddPatient: boolean;
  canAddStaff: boolean;
}

@Injectable()
export class PlanLimitsService {
  constructor(
    @InjectRepository(BranchSubscription)
    private readonly subRepo: Repository<BranchSubscription>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getLimitsAndUsage(branchId: string): Promise<PlanLimitUsage | null> {
    const sub = await this.subRepo.findOne({
      where: { branchId, status: In([...ALLOWED_STATUSES]) },
      relations: ['plan'],
    });
    if (!sub?.plan) return null;

    const features = sub.plan.features ?? {};
    const maxPatients = typeof features.maxPatients === 'number' ? features.maxPatients : 1000;
    const maxStaff = typeof features.maxStaff === 'number' ? features.maxStaff : 50;
    const maxBranches = typeof features.maxBranches === 'number' ? features.maxBranches : 1;
    const imaging = features.imaging !== false;
    const reports = features.reports !== false;
    const inventory = features.inventory !== false;

    const patientRow = await this.patientRepo
      .createQueryBuilder('p')
      .where('p.branchId = :branchId', { branchId })
      .andWhere('p.deletedAt IS NULL')
      .select('COUNT(p.id)', 'c')
      .getRawOne<{ c: string }>();

    const staffRow = await this.userRepo
      .createQueryBuilder('u')
      .where('u.branchId = :branchId', { branchId })
      .andWhere('u.isActive = true')
      .select('COUNT(u.id)', 'c')
      .getRawOne<{ c: string }>();

    const patients = parseInt(patientRow?.c ?? '0', 10);
    const staff = parseInt(staffRow?.c ?? '0', 10);

    return {
      planId: sub.plan.id,
      planName: sub.plan.name,
      features,
      limits: { maxPatients, maxStaff, maxBranches, imaging, reports, inventory },
      usage: { patients, staff, branches: 1 },
      canAddPatient: patients < maxPatients,
      canAddStaff: staff < maxStaff,
    };
  }

  async canUseFeature(branchId: string, feature: keyof PlanFeatures): Promise<boolean> {
    const limits = await this.getLimitsAndUsage(branchId);
    if (!limits) return true;
    const val = limits.limits[feature as keyof PlanLimitUsage['limits']];
    if (typeof val === 'number') return limits.usage[feature as keyof PlanLimitUsage['usage']] < val;
    return val === true;
  }
}

