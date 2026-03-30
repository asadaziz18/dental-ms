import { Repository } from 'typeorm';
import { InsuranceClaim } from '../../database/entities/insurance-claim.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { UpdateInsuranceClaimDto } from './dto/update-insurance-claim.dto';
export declare class InsuranceClaimsService {
    private readonly claimRepo;
    private readonly patientRepo;
    constructor(claimRepo: Repository<InsuranceClaim>, patientRepo: Repository<Patient>);
    findByPatient(branchId: string, patientId: string): Promise<InsuranceClaim[]>;
    findOne(branchId: string, id: string): Promise<InsuranceClaim>;
    create(branchId: string, dto: CreateInsuranceClaimDto): Promise<InsuranceClaim>;
    update(branchId: string, id: string, dto: UpdateInsuranceClaimDto): Promise<InsuranceClaim>;
    remove(branchId: string, id: string): Promise<void>;
}
