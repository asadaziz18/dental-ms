import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(branchId: string, dto: CreatePatientDto): Promise<import("../../database/entities").Patient>;
    findAll(branchId: string, query: PatientQueryDto): Promise<{
        data: import("../../database/entities").Patient[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").Patient>;
    update(branchId: string, id: string, dto: UpdatePatientDto): Promise<import("../../database/entities").Patient>;
    remove(branchId: string, id: string): Promise<void>;
    getTimeline(branchId: string, id: string): Promise<{
        patientId: string;
        events: import("@dental-ms/shared-types").TimelineEvent[];
    }>;
}
