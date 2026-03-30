import { Repository } from 'typeorm';
import { DoctorCommissionRate } from '../../database/entities/doctor-commission-rate.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { User } from '../../database/entities/user.entity';
import { SetCommissionRateDto } from './dto/doctor-commission.dto';
export declare class DoctorCommissionService {
    private readonly rateRepo;
    private readonly invoiceRepo;
    private readonly userRepo;
    constructor(rateRepo: Repository<DoctorCommissionRate>, invoiceRepo: Repository<Invoice>, userRepo: Repository<User>);
    getRate(branchId: string, doctorId: string): Promise<DoctorCommissionRate | null>;
    setRate(branchId: string, doctorId: string, dto: SetCommissionRateDto): Promise<DoctorCommissionRate>;
    getCommissionSummary(branchId: string, doctorId?: string, fromDate?: string, toDate?: string): Promise<{
        doctorId: string;
        doctorName: string;
        totalRevenue: number;
        ratePercent: number;
        commission: number;
    }[]>;
}
