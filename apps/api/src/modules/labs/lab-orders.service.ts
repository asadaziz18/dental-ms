import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import type { LabTrialOutcome } from '../../database/entities/lab-trial.entity';
import { LabNotificationService } from './lab-notification.service';

@Injectable()
export class LabOrdersService {
  constructor(
    @InjectRepository(LabOrder)
    private readonly orderRepo: Repository<LabOrder>,
    @InjectRepository(LabTrial)
    private readonly trialRepo: Repository<LabTrial>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly notificationService: LabNotificationService,
  ) {}

  async getTenantIdFromBranch(branchId: string): Promise<string | null> {
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
      select: ['tenantId'],
    });
    return branch?.tenantId ?? null;
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LAB-${year}-`;
    const last = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.orderNumber')
      .where('o.tenantId = :tenantId', { tenantId })
      .andWhere('o.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('o.orderNumber', 'DESC')
      .limit(1)
      .getRawOne<{ orderNumber: string }>();
    const nextNum = last
      ? parseInt(last.orderNumber.slice(prefix.length), 10) + 1
      : 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  }

  async findAll(
    branchId: string,
    tenantId: string | null,
    query: LabOrderQueryDto,
  ): Promise<{
    data: LabOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.patient', 'patient')
      .leftJoinAndSelect('o.doctor', 'doctor')
      .leftJoinAndSelect('o.vendor', 'vendor')
      .where('o.branchId = :branchId', { branchId });

    if (tenantId != null) {
      qb.andWhere('o.tenantId = :tenantId', { tenantId });
    }
    if (query.patientId) {
      qb.andWhere('o.patientId = :patientId', { patientId: query.patientId });
    }
    if (query.vendorId) {
      qb.andWhere('o.vendorId = :vendorId', { vendorId: query.vendorId });
    }
    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }
    if (query.branchId && query.branchId !== branchId) {
      qb.andWhere('o.branchId = :filterBranchId', {
        filterBranchId: query.branchId,
      });
    }
    if (query.from) {
      qb.andWhere('o.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('o.createdAt <= :to', { to: query.to });
    }
    if (query.priority) {
      qb.andWhere('o.priority = :priority', { priority: query.priority });
    }
    if (query.doctorId) {
      qb.andWhere('o.doctorId = :doctorId', { doctorId: query.doctorId });
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere(
        '(o.orderNumber ILIKE :term OR patient."firstName" ILIKE :term OR patient."lastName" ILIKE :term)',
        { term },
      );
    }

    const [data, total] = await qb
      .orderBy('o.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(
    id: string,
    branchId: string,
    tenantId: string | null,
  ): Promise<LabOrder> {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.patient', 'patient')
      .leftJoinAndSelect('o.doctor', 'doctor')
      .leftJoinAndSelect('o.vendor', 'vendor')
      .leftJoinAndSelect('o.branch', 'branch')
      .leftJoinAndSelect('o.trials', 'trials', undefined, undefined)
      .leftJoinAndSelect('o.notifications', 'notifications')
      .where('o.id = :id', { id })
      .andWhere('o.branchId = :branchId', { branchId });
    if (tenantId != null) {
      qb.andWhere('o.tenantId = :tenantId', { tenantId });
    }
    const order = await qb.orderBy('trials.trialNumber', 'ASC').getOne();
    if (!order) throw new NotFoundException('Lab order not found');
    return order;
  }

  async create(
    tenantId: string,
    branchId: string,
    userId: string,
    dto: CreateLabOrderDto,
  ): Promise<LabOrder> {
    const orderNumber = await this.generateOrderNumber(tenantId);
    const order = this.orderRepo.create({
      ...dto,
      tenantId,
      branchId,
      createdBy: userId,
      orderNumber,
      status: dto.sentToLabAt ? 'sent_to_lab' : 'draft',
      sentToLabAt: dto.sentToLabAt ? new Date(dto.sentToLabAt) : null,
      expectedTrialDate: dto.expectedTrialDate
        ? new Date(dto.expectedTrialDate)
        : null,
      finalDeliveryDate: dto.finalDeliveryDate
        ? new Date(dto.finalDeliveryDate)
        : null,
      labFee: dto.labFee != null ? String(dto.labFee) : null,
      isPaid: dto.isPaid ?? false,
      attachments: dto.attachments ?? [],
    });
    return this.orderRepo.save(order);
  }

  async update(
    id: string,
    branchId: string,
    tenantId: string | null,
    dto: UpdateLabOrderDto,
  ): Promise<LabOrder> {
    const order = await this.findOne(id, branchId, tenantId);
    const updates: Partial<LabOrder> = {};
    if (dto.patientId !== undefined) updates.patientId = dto.patientId;
    if (dto.doctorId !== undefined) updates.doctorId = dto.doctorId;
    if (dto.vendorId !== undefined) updates.vendorId = dto.vendorId;
    if (dto.treatmentId !== undefined) updates.treatmentId = dto.treatmentId;
    if (dto.workType !== undefined) updates.workType = dto.workType;
    if (dto.customWorkType !== undefined) updates.customWorkType = dto.customWorkType;
    if (dto.toothNumbers !== undefined) updates.toothNumbers = dto.toothNumbers;
    if (dto.shade !== undefined) updates.shade = dto.shade;
    if (dto.material !== undefined) updates.material = dto.material;
    if (dto.instructions !== undefined) updates.instructions = dto.instructions;
    if (dto.priority !== undefined) updates.priority = dto.priority;
    if (dto.attachments !== undefined) updates.attachments = dto.attachments;
    if (dto.sentToLabAt !== undefined)
      updates.sentToLabAt = dto.sentToLabAt ? new Date(dto.sentToLabAt) : null;
    if (dto.expectedTrialDate !== undefined)
      updates.expectedTrialDate = dto.expectedTrialDate ? new Date(dto.expectedTrialDate) : null;
    if (dto.finalDeliveryDate !== undefined)
      updates.finalDeliveryDate = dto.finalDeliveryDate ? new Date(dto.finalDeliveryDate) : null;
    if (dto.labFee !== undefined)
      updates.labFee = dto.labFee != null ? String(dto.labFee) : null;
    if (dto.isPaid !== undefined) updates.isPaid = dto.isPaid;
    Object.assign(order, updates);
    await this.orderRepo.save(order);
    return this.findOne(id, branchId, tenantId);
  }

  async updateStatus(
    id: string,
    branchId: string,
    tenantId: string | null,
    status: LabOrderStatus,
  ): Promise<LabOrder> {
    const order = await this.findOne(id, branchId, tenantId);
    order.status = status;
    if (status === 'delivered') {
      order.finalDeliveryDate = new Date();
    }
    await this.orderRepo.save(order);
    return this.findOne(id, branchId, tenantId);
  }

  async updatePayment(
    id: string,
    branchId: string,
    tenantId: string | null,
    isPaid: boolean,
    labFee?: number | null,
  ): Promise<LabOrder> {
    const order = await this.findOne(id, branchId, tenantId);
    order.isPaid = isPaid;
    order.paidAt = isPaid ? new Date() : null;
    if (labFee !== undefined) order.labFee = labFee != null ? String(labFee) : null;
    await this.orderRepo.save(order);
    return this.findOne(id, branchId, tenantId);
  }

  async addAttachment(
    id: string,
    branchId: string,
    tenantId: string | null,
    url: string,
  ): Promise<LabOrder> {
    const order = await this.findOne(id, branchId, tenantId);
    const attachments = [...(order.attachments || []), url];
    if (attachments.length > 10) {
      throw new BadRequestException('Max 10 attachments per order');
    }
    (order as any).attachments = attachments;
    await this.orderRepo.save(order);
    return this.findOne(id, branchId, tenantId);
  }

  // —— Trials ——
  async getTrials(
    orderId: string,
    branchId: string,
    tenantId: string | null,
  ): Promise<LabTrial[]> {
    await this.findOne(orderId, branchId, tenantId);
    return this.trialRepo.find({
      where: { labOrderId: orderId },
      order: { trialNumber: 'ASC' },
    });
  }

  async createTrial(
    orderId: string,
    branchId: string,
    tenantId: string | null,
    _userId: string,
    dto: CreateLabTrialDto,
  ): Promise<LabTrial> {
    const notifyPatient = dto.notifyPatient ?? true;
    const channel = dto.channel ?? 'both';
    const order = await this.findOne(orderId, branchId, tenantId);
    const lastTrial = await this.trialRepo.findOne({
      where: { labOrderId: orderId },
      order: { trialNumber: 'DESC' },
      select: ['trialNumber'],
    });
    const trialNumber = (lastTrial?.trialNumber ?? 0) + 1;
    const trial = this.trialRepo.create({
      labOrderId: orderId,
      trialNumber,
      trialDate: new Date(dto.trialDate),
      status: 'scheduled',
      doctorNotes: dto.doctorNotes ?? null,
      labInstructions: dto.labInstructions ?? null,
    });
    const saved = await this.trialRepo.save(trial);
    order.status = 'trial_scheduled';
    order.expectedTrialDate = new Date(dto.trialDate);
    await this.orderRepo.save(order);

    if (notifyPatient) {
      await this.notificationService.sendTrialScheduledNotification(
        saved,
        order,
        channel,
      );
      saved.patientNotified = true;
      saved.patientNotifiedAt = new Date();
      saved.patientNotificationChannel = channel;
      await this.trialRepo.save(saved);
    }
    return saved;
  }

  async updateTrial(
    orderId: string,
    trialId: string,
    branchId: string,
    tenantId: string | null,
    dto: UpdateLabTrialDto,
  ): Promise<LabTrial> {
    const trial = await this.getTrialOrFail(orderId, trialId, branchId, tenantId);
    Object.assign(trial, {
      ...dto,
      trialDate: dto.trialDate ? new Date(dto.trialDate) : trial.trialDate,
    });
    return this.trialRepo.save(trial);
  }

  async completeTrial(
    orderId: string,
    trialId: string,
    branchId: string,
    tenantId: string | null,
    userId: string,
    dto: CompleteTrialDto,
  ): Promise<LabTrial> {
    const order = await this.findOne(orderId, branchId, tenantId);
    const trial = await this.getTrialOrFail(orderId, trialId, branchId, tenantId);
    trial.status = 'completed';
    trial.completedAt = new Date(dto.completedAt);
    trial.completedBy = userId;
    trial.outcome = dto.outcome as LabTrialOutcome;
    trial.doctorNotes = dto.doctorNotes;
    trial.labInstructions = dto.labInstructions ?? null;
    trial.attachments = dto.attachments ?? trial.attachments ?? [];
    await this.trialRepo.save(trial);

    if (dto.outcome === 'approved') {
      order.status = 'approved';
    } else if (dto.outcome === 'adjustments_needed') {
      order.status = 'trial_in_progress';
    } else if (dto.outcome === 'rejected') {
      order.status = 'rejected';
    }
    await this.orderRepo.save(order);
    return trial;
  }

  async notifyTrial(
    orderId: string,
    trialId: string,
    branchId: string,
    tenantId: string | null,
    channel: 'whatsapp' | 'email' | 'both',
    message?: string,
  ): Promise<void> {
    const order = await this.findOne(orderId, branchId, tenantId);
    const trial = await this.getTrialOrFail(orderId, trialId, branchId, tenantId);
    await this.notificationService.sendTrialScheduledNotification(
      trial,
      order,
      channel,
      message,
    );
    trial.patientNotified = true;
    trial.patientNotifiedAt = new Date();
    trial.patientNotificationChannel = channel;
    await this.trialRepo.save(trial);
  }

  private async getTrialOrFail(
    orderId: string,
    trialId: string,
    branchId: string,
    tenantId: string | null,
  ): Promise<LabTrial> {
    await this.findOne(orderId, branchId, tenantId);
    const trial = await this.trialRepo.findOne({
      where: { id: trialId, labOrderId: orderId },
    });
    if (!trial) throw new NotFoundException('Trial not found');
    return trial;
  }

  // Dashboard stats
  async getDashboardStats(
    branchId: string,
    tenantId: string | null,
  ): Promise<{
    activeOrders: number;
    trialsThisWeek: number;
    awaitingDelivery: number;
    overdueOrders: number;
    upcomingTrials: Array<{
      trial: LabTrial;
      order: LabOrder;
      patient: { id: string; firstName: string; lastName: string };
      vendor: { id: string; name: string };
    }>;
    recentOrders: LabOrder[];
  }> {
    const baseWhere: any = { branchId };
    if (tenantId != null) baseWhere.tenantId = tenantId;

    const activeStatuses = [
      'draft',
      'sent_to_lab',
      'trial_scheduled',
      'trial_in_progress',
      'approved',
    ];
    const activeOrders = await this.orderRepo.count({
      where: { ...baseWhere, status: In(activeStatuses) },
    });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const trialsQb = this.trialRepo
      .createQueryBuilder('t')
      .innerJoin('t.labOrder', 'o')
      .where('o.branchId = :branchId', { branchId })
      .andWhere('t.trialDate >= :from', { from: weekStart.toISOString().slice(0, 10) })
      .andWhere('t.trialDate <= :to', { to: weekEnd.toISOString().slice(0, 10) })
      .andWhere('t.status = :status', { status: 'scheduled' });
    if (tenantId != null) {
      trialsQb.andWhere('o.tenantId = :tenantId', { tenantId });
    }
    const trialsThisWeek = await trialsQb.getCount();

    const awaitingDelivery = await this.orderRepo.count({
      where: { ...baseWhere, status: 'approved' },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const overdueQb = this.orderRepo
      .createQueryBuilder('o')
      .where('o.branchId = :branchId', { branchId })
      .andWhere('o.sentToLabAt IS NOT NULL')
      .andWhere('o.sentToLabAt <= :cutoff', { cutoff: thirtyDaysAgo })
      .andWhere('o.status NOT IN (:...done)', {
        done: ['delivered', 'cancelled', 'rejected'],
      });
    if (tenantId != null) {
      overdueQb.andWhere('o.tenantId = :tenantId', { tenantId });
    }
    const overdueOrders = await overdueQb.getCount();

    const upcomingTrialsData = await this.trialRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('t.labOrder', 'o')
      .innerJoinAndSelect('o.patient', 'patient')
      .innerJoinAndSelect('o.vendor', 'vendor')
      .where('o.branchId = :branchId', { branchId })
      .andWhere('t.trialDate >= :today', {
        today: new Date().toISOString().slice(0, 10),
      })
      .andWhere('t.trialDate <= :week', {
        week: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      })
      .andWhere('t.status = :status', { status: 'scheduled' })
      .orderBy('t.trialDate', 'ASC')
      .take(20)
      .getMany();

    const upcomingTrials = upcomingTrialsData.map((t) => ({
      trial: t,
      order: t.labOrder,
      patient: {
        id: t.labOrder.patient.id,
        firstName: t.labOrder.patient.firstName,
        lastName: t.labOrder.patient.lastName,
      },
      vendor: { id: t.labOrder.vendor.id, name: t.labOrder.vendor.name },
    }));

    const recentOrders = await this.orderRepo.find({
      where: baseWhere,
      relations: ['patient', 'vendor'],
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    return {
      activeOrders,
      trialsThisWeek,
      awaitingDelivery,
      overdueOrders,
      upcomingTrials,
      recentOrders,
    };
  }
}
