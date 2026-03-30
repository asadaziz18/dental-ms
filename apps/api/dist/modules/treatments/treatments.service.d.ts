import { Repository } from 'typeorm';
import { TreatmentPlan } from '../../database/entities/treatment-plan.entity';
import { TreatmentPlanItem } from '../../database/entities/treatment-plan-item.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';
import { CreateTreatmentPlanItemDto } from './dto/create-treatment-plan-item.dto';
import { UpdateTreatmentPlanItemDto } from './dto/update-treatment-plan-item.dto';
export declare class TreatmentsService {
    private readonly planRepo;
    private readonly itemRepo;
    private readonly patientRepo;
    constructor(planRepo: Repository<TreatmentPlan>, itemRepo: Repository<TreatmentPlanItem>, patientRepo: Repository<Patient>);
    findByPatient(branchId: string, patientId: string): Promise<TreatmentPlan[]>;
    findOne(branchId: string, id: string): Promise<TreatmentPlan>;
    create(branchId: string, dto: CreateTreatmentPlanDto): Promise<TreatmentPlan>;
    update(branchId: string, id: string, dto: UpdateTreatmentPlanDto): Promise<TreatmentPlan>;
    remove(branchId: string, id: string): Promise<{
        success: boolean;
    }>;
    addItem(branchId: string, treatmentPlanId: string, dto: CreateTreatmentPlanItemDto): Promise<TreatmentPlanItem>;
    updateItem(branchId: string, treatmentPlanId: string, itemId: string, dto: UpdateTreatmentPlanItemDto): Promise<TreatmentPlanItem>;
    removeItem(branchId: string, treatmentPlanId: string, itemId: string): Promise<{
        success: boolean;
    }>;
}
