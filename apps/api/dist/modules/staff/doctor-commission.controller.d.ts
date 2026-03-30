import { DoctorCommissionService } from './doctor-commission.service';
import { SetCommissionRateDto } from './dto/doctor-commission.dto';
export declare class DoctorCommissionController {
    private readonly commissionService;
    constructor(commissionService: DoctorCommissionService);
    getSummary(branchId: string, doctorId?: string, fromDate?: string, toDate?: string): Promise<{
        doctorId: string;
        doctorName: string;
        totalRevenue: number;
        ratePercent: number;
        commission: number;
    }[]>;
    getRate(branchId: string, doctorId: string): Promise<import("../../database/entities").DoctorCommissionRate | null>;
    setRate(branchId: string, doctorId: string, dto: SetCommissionRateDto): Promise<import("../../database/entities").DoctorCommissionRate>;
}
