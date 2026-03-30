import { PrescriptionItemDto } from './create-prescription.dto';
export declare class UpdatePrescriptionDto {
    treatmentPlanId?: string | null;
    items?: PrescriptionItemDto[];
    notes?: string | null;
}
