import { Repository } from 'typeorm';
import { Patient } from '../../database/entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import type { TimelineEvent } from '@dental-ms/shared-types';
export declare class PatientsService {
    private readonly repo;
    constructor(repo: Repository<Patient>);
    create(branchId: string, dto: CreatePatientDto): Promise<Patient>;
    findAll(branchId: string, query: PatientQueryDto): Promise<{
        data: Patient[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(branchId: string, id: string): Promise<Patient>;
    update(branchId: string, id: string, dto: UpdatePatientDto): Promise<Patient>;
    remove(branchId: string, id: string, deletedBy?: string): Promise<void>;
    getTimeline(branchId: string, patientId: string): Promise<{
        patientId: string;
        events: TimelineEvent[];
    }>;
}
