import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(branchId: string, date?: string): Promise<{
        todayAppointments: number;
        revenueToday: number;
        newPatientsToday: number;
        pendingPayments: number;
        date: string;
    }>;
    getRevenueTrend(branchId: string, fromDate: string, toDate: string, groupBy?: 'day' | 'week' | 'month', doctorId?: string): Promise<{
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
