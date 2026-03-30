import { DashboardService } from './dashboard.service';
import { RequestUser } from '../auth/decorators/current-user.decorator';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(branchId: string): Promise<{
        todayAppointments: {
            total: number;
            confirmed: number;
            pending: number;
        };
        todayRevenue: {
            amount: number;
            invoicesPaid: number;
        };
        newPatientsThisMonth: {
            count: number;
            vsLastMonth: number;
        };
        pendingPayments: {
            totalAmount: number;
            overdueCount: number;
        };
    }>;
    getTodayAppointments(branchId: string, user: RequestUser, doctorId?: string): Promise<import("../../database/entities").Appointment[]>;
    getRevenueChart(branchId: string, range?: '30d' | '12m'): Promise<{
        date: string;
        invoiced: number;
        collected: number;
    }[]>;
    getUpcomingAppointments(branchId: string, user: RequestUser, days?: string, doctorId?: string): Promise<import("../../database/entities").Appointment[]>;
    getLowStock(branchId: string): Promise<{
        itemId: string;
        name: string;
        sku: string;
        currentQuantity: number;
        reorderThreshold: number;
        branchId: string;
    }[]>;
    getDoctorPerformance(branchId: string, month?: string): Promise<{
        doctorId: string;
        name: string;
        patientsSeen: number;
        proceduresDone: number;
        revenue: number;
    }[]>;
}
