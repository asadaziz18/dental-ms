import { Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Patient } from '../../database/entities/patient.entity';
import { TreatmentPlanItem } from '../../database/entities/treatment-plan-item.entity';
import { InvoiceLineItem } from '../../database/entities/invoice-line-item.entity';
import { Procedure } from '../../database/entities/procedure.entity';
import { User } from '../../database/entities/user.entity';
export declare class ReportsService {
    private readonly appointmentRepo;
    private readonly invoiceRepo;
    private readonly paymentRepo;
    private readonly patientRepo;
    private readonly planItemRepo;
    private readonly lineItemRepo;
    private readonly procedureRepo;
    private readonly userRepo;
    constructor(appointmentRepo: Repository<Appointment>, invoiceRepo: Repository<Invoice>, paymentRepo: Repository<Payment>, patientRepo: Repository<Patient>, planItemRepo: Repository<TreatmentPlanItem>, lineItemRepo: Repository<InvoiceLineItem>, procedureRepo: Repository<Procedure>, userRepo: Repository<User>);
    getDashboard(branchId: string, date?: string): Promise<{
        todayAppointments: number;
        revenueToday: number;
        newPatientsToday: number;
        pendingPayments: number;
        date: string;
    }>;
    getRevenueTrend(branchId: string, fromDate: string, toDate: string, groupBy: 'day' | 'week' | 'month', doctorId?: string): Promise<{
        period: string;
        total: number;
    }[]>;
    getTreatmentDistribution(branchId: string, fromDate?: string, toDate?: string): Promise<{
        name: string;
        code: string;
        count: number;
        revenue: number;
    }[]>;
    getDoctorPerformance(branchId: string, fromDate?: string, toDate?: string): Promise<{
        doctorId: string;
        doctorName: string;
        invoicesCount: number;
        proceduresCompleted: number;
        revenue: number;
    }[]>;
    getNoShowRate(branchId: string, fromDate?: string, toDate?: string, doctorId?: string): Promise<{
        total: number;
        noShows: number;
        noShowRatePercent: number;
    }>;
}
