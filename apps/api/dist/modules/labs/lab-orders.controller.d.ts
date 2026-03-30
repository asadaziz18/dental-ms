import { Response } from 'express';
import { LabOrdersService } from './lab-orders.service';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { OrderStatusDto } from './dto/order-status.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { CreateLabTrialDto } from './dto/create-lab-trial.dto';
import { UpdateLabTrialDto } from './dto/update-lab-trial.dto';
import { CompleteTrialDto } from './dto/complete-trial.dto';
import { TrialNotifyDto } from './dto/trial-notify.dto';
import { LabOrderQueryDto } from './dto/lab-query.dto';
import { RequestUser } from '../auth/decorators/current-user.decorator';
import type { IStorageService } from '../imaging/storage/storage.interface';
import { ConfigService } from '@nestjs/config';
interface MulterFile {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare class LabOrdersController {
    private readonly ordersService;
    private readonly config;
    private readonly storage;
    constructor(ordersService: LabOrdersService, config: ConfigService, storage: IStorageService);
    private getTenantId;
    getDashboard(branchId: string, user: RequestUser): Promise<{
        activeOrders: number;
        trialsThisWeek: number;
        awaitingDelivery: number;
        overdueOrders: number;
        upcomingTrials: Array<{
            trial: import("../../database/entities").LabTrial;
            order: import("../../database/entities").LabOrder;
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
        recentOrders: import("../../database/entities").LabOrder[];
    }>;
    findAll(branchId: string, user: RequestUser, query: LabOrderQueryDto): Promise<{
        data: import("../../database/entities").LabOrder[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(branchId: string, user: RequestUser, dto: CreateLabOrderDto): Promise<import("../../database/entities").LabOrder>;
    findOne(id: string, branchId: string, user: RequestUser): Promise<import("../../database/entities").LabOrder>;
    update(id: string, branchId: string, user: RequestUser, dto: UpdateLabOrderDto): Promise<import("../../database/entities").LabOrder>;
    updateStatus(id: string, branchId: string, user: RequestUser, dto: OrderStatusDto): Promise<import("../../database/entities").LabOrder>;
    updatePayment(id: string, branchId: string, user: RequestUser, dto: OrderPaymentDto): Promise<import("../../database/entities").LabOrder>;
    addAttachment(id: string, branchId: string, user: RequestUser, file: MulterFile): Promise<import("../../database/entities").LabOrder>;
    serveAttachment(id: string, branchId: string, user: RequestUser, key: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTrials(orderId: string, branchId: string, user: RequestUser): Promise<import("../../database/entities").LabTrial[]>;
    createTrial(orderId: string, branchId: string, user: RequestUser, dto: CreateLabTrialDto): Promise<import("../../database/entities").LabTrial>;
    updateTrial(orderId: string, trialId: string, branchId: string, user: RequestUser, dto: UpdateLabTrialDto): Promise<import("../../database/entities").LabTrial>;
    completeTrial(orderId: string, trialId: string, branchId: string, user: RequestUser, dto: CompleteTrialDto): Promise<import("../../database/entities").LabTrial>;
    notifyTrial(orderId: string, trialId: string, branchId: string, user: RequestUser, dto: TrialNotifyDto): Promise<void>;
}
export {};
