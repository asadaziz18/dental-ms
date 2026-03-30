import { TreatmentsService } from './treatments.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';
import { CreateTreatmentPlanItemDto } from './dto/create-treatment-plan-item.dto';
import { UpdateTreatmentPlanItemDto } from './dto/update-treatment-plan-item.dto';
export declare class TreatmentsController {
    private readonly treatmentsService;
    constructor(treatmentsService: TreatmentsService);
    findByPatient(branchId: string, patientId: string): Promise<import("../../database/entities").TreatmentPlan[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").TreatmentPlan>;
    create(branchId: string, dto: CreateTreatmentPlanDto): Promise<import("../../database/entities").TreatmentPlan>;
    update(branchId: string, id: string, dto: UpdateTreatmentPlanDto): Promise<import("../../database/entities").TreatmentPlan>;
    remove(branchId: string, id: string): Promise<{
        success: boolean;
    }>;
    addItem(branchId: string, id: string, dto: CreateTreatmentPlanItemDto): Promise<import("../../database/entities").TreatmentPlanItem>;
    updateItem(branchId: string, id: string, itemId: string, dto: UpdateTreatmentPlanItemDto): Promise<import("../../database/entities").TreatmentPlanItem>;
    removeItem(branchId: string, id: string, itemId: string): Promise<{
        success: boolean;
    }>;
}
