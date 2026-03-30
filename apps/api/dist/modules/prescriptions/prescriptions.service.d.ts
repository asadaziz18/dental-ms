import { Repository } from 'typeorm';
import { Prescription } from '../../database/entities/prescription.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
export declare class PrescriptionsService {
    private readonly repo;
    private readonly patientRepo;
    constructor(repo: Repository<Prescription>, patientRepo: Repository<Patient>);
    findByPatient(branchId: string, patientId: string): Promise<Prescription[]>;
    findOne(patientId: string, id: string): Promise<Prescription>;
    create(branchId: string, prescribedById: string, dto: CreatePrescriptionDto): Promise<Prescription>;
    update(patientId: string, id: string, dto: UpdatePrescriptionDto): Promise<Prescription>;
    remove(patientId: string, id: string): Promise<{
        success: boolean;
    }>;
}
