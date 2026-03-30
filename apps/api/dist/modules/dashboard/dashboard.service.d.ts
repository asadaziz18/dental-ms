import { Repository } from 'typeorm';
import { Appointment, Invoice, Payment, Patient, InventoryItem, StockLevel, Branch } from '../../database/entities';
import { ReportsService } from '../reports/reports.service';
import { AppointmentsService } from '../appointments/appointments.service';
export declare class DashboardService {
    private readonly appointmentRepo;
    private readonly invoiceRepo;
    private readonly paymentRepo;
    private readonly patientRepo;
    private readonly inventoryItemRepo;
    private readonly stockLevelRepo;
    private readonly branchRepo;
    private readonly reportsService;
    private readonly appointmentsService;
    constructor(appointmentRepo: Repository<Appointment>, invoiceRepo: Repository<Invoice>, paymentRepo: Repository<Payment>, patientRepo: Repository<Patient>, inventoryItemRepo: Repository<InventoryItem>, stockLevelRepo: Repository<StockLevel>, branchRepo: Repository<Branch>, reportsService: ReportsService, appointmentsService: AppointmentsService);
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
    getTodayAppointments(branchId: string, doctorId?: string): Promise<Appointment[]>;
    getRevenueChart(branchId: string, range: '30d' | '12m'): Promise<{
        date: string;
        invoiced: number;
        collected: number;
    }[]>;
    getUpcomingAppointments(branchId: string, days: number, doctorId?: string): Promise<Appointment[]>;
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
