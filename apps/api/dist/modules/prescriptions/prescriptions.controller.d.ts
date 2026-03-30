import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { RequestUser } from '../auth/decorators/current-user.decorator';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    findByPatient(branchId: string, patientId: string): Promise<import("../../database/entities").Prescription[]>;
    findOne(patientId: string, id: string): Promise<import("../../database/entities").Prescription>;
    create(branchId: string, user: RequestUser, dto: CreatePrescriptionDto): Promise<import("../../database/entities").Prescription>;
    update(patientId: string, id: string, dto: UpdatePrescriptionDto): Promise<import("../../database/entities").Prescription>;
    remove(patientId: string, id: string): Promise<{
        success: boolean;
    }>;
}
