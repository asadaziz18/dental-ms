import { Repository } from 'typeorm';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabTrial } from '../../database/entities/lab-trial.entity';
import { Branch } from '../../database/entities/branch.entity';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { CreateLabTrialDto } from './dto/create-lab-trial.dto';
import { UpdateLabTrialDto } from './dto/update-lab-trial.dto';
import { CompleteTrialDto } from './dto/complete-trial.dto';
import { LabOrderQueryDto } from './dto/lab-query.dto';
import type { LabOrderStatus } from '../../database/entities/lab-order.entity';
import { LabNotificationService } from './lab-notification.service';
export declare class LabOrdersService {
    private readonly orderRepo;
    private readonly trialRepo;
    private readonly branchRepo;
    private readonly notificationService;
    constructor(orderRepo: Repository<LabOrder>, trialRepo: Repository<LabTrial>, branchRepo: Repository<Branch>, notificationService: LabNotificationService);
    getTenantIdFromBranch(branchId: string): Promise<string | null>;
    private generateOrderNumber;
    findAll(branchId: string, tenantId: string | null, query: LabOrderQueryDto): Promise<{
        data: LabOrder[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, branchId: string, tenantId: string | null): Promise<LabOrder>;
    create(tenantId: string, branchId: string, userId: string, dto: CreateLabOrderDto): Promise<LabOrder>;
    update(id: string, branchId: string, tenantId: string | null, dto: UpdateLabOrderDto): Promise<LabOrder>;
    updateStatus(id: string, branchId: string, tenantId: string | null, status: LabOrderStatus): Promise<LabOrder>;
    updatePayment(id: string, branchId: string, tenantId: string | null, isPaid: boolean, labFee?: number | null): Promise<LabOrder>;
    addAttachment(id: string, branchId: string, tenantId: string | null, url: string): Promise<LabOrder>;
    getTrials(orderId: string, branchId: string, tenantId: string | null): Promise<LabTrial[]>;
    createTrial(orderId: string, branchId: string, tenantId: string | null, _userId: string, dto: CreateLabTrialDto): Promise<LabTrial>;
    updateTrial(orderId: string, trialId: string, branchId: string, tenantId: string | null, dto: UpdateLabTrialDto): Promise<LabTrial>;
    completeTrial(orderId: string, trialId: string, branchId: string, tenantId: string | null, userId: string, dto: CompleteTrialDto): Promise<LabTrial>;
    notifyTrial(orderId: string, trialId: string, branchId: string, tenantId: string | null, channel: 'whatsapp' | 'email' | 'both', message?: string): Promise<void>;
    private getTrialOrFail;
    getDashboardStats(branchId: string, tenantId: string | null): Promise<{
        activeOrders: number;
        trialsThisWeek: number;
        awaitingDelivery: number;
        overdueOrders: number;
        upcomingTrials: Array<{
            trial: LabTrial;
            order: LabOrder;
            patient: {
                id: string;
                firstName: string;
                lastName: string;
            };
            vendor: {
                id: string;
                name: string;
            };
        }>;
        recentOrders: LabOrder[];
    }>;
}
