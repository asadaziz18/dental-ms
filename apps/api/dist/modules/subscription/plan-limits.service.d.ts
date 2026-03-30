import { Repository } from 'typeorm';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import { Patient } from '../../database/entities/patient.entity';
import { User } from '../../database/entities/user.entity';
import type { PlanFeatures } from '../../database/entities/subscription-plan.entity';
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
export declare class PlanLimitsService {
    private readonly subRepo;
    private readonly patientRepo;
    private readonly userRepo;
    constructor(subRepo: Repository<BranchSubscription>, patientRepo: Repository<Patient>, userRepo: Repository<User>);
    getLimitsAndUsage(branchId: string): Promise<PlanLimitUsage | null>;
    canUseFeature(branchId: string, feature: keyof PlanFeatures): Promise<boolean>;
}
