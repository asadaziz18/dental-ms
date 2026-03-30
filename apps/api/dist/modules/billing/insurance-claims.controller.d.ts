import { InsuranceClaimsService } from './insurance-claims.service';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { UpdateInsuranceClaimDto } from './dto/update-insurance-claim.dto';
export declare class InsuranceClaimsController {
    private readonly claimsService;
    constructor(claimsService: InsuranceClaimsService);
    findByPatient(branchId: string, patientId: string): Promise<import("../../database/entities").InsuranceClaim[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").InsuranceClaim>;
    create(branchId: string, dto: CreateInsuranceClaimDto): Promise<import("../../database/entities").InsuranceClaim>;
    update(branchId: string, id: string, dto: UpdateInsuranceClaimDto): Promise<import("../../database/entities").InsuranceClaim>;
    remove(branchId: string, id: string): Promise<void>;
}
