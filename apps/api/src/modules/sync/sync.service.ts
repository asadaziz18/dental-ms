import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncEvent } from '../../database/entities/sync-event.entity';
import { StaffService } from '../staff/staff.service';
import { StaffScheduleService } from '../staff/staff-schedule.service';
import { StaffAttendanceService } from '../staff/staff-attendance.service';
import { StaffLeaveService } from '../staff/staff-leave.service';
import { DoctorCommissionService } from '../staff/doctor-commission.service';
import type { UserRole } from '../../database/entities/user.entity';
import type { CreateStaffDto } from '../staff/dto/create-staff.dto';
import type { UpdateStaffDto } from '../staff/dto/update-staff.dto';

export interface SyncOperationInput {
  entity: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  clientId?: string;
}

export interface SyncPushResult {
  success: boolean;
  serverId?: string;
  error?: string;
}

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncEvent)
    private readonly syncEventRepo: Repository<SyncEvent>,
    private readonly staffService: StaffService,
    private readonly staffScheduleService: StaffScheduleService,
    private readonly staffAttendanceService: StaffAttendanceService,
    private readonly staffLeaveService: StaffLeaveService,
    private readonly doctorCommissionService: DoctorCommissionService,
  ) {}

  async push(
    branchId: string,
    currentUserRole: UserRole,
    allowedBranches: string[],
    operations: SyncOperationInput[],
  ): Promise<SyncPushResult[]> {
    const results: SyncPushResult[] = [];
    const eventsToRecord: Array<{ entity: string; entityId: string; operation: 'create' | 'update' | 'delete'; payload: Record<string, unknown> }> = [];
    for (const op of operations) {
      try {
        const result = await this.applyOne(branchId, currentUserRole, allowedBranches, op);
        results.push(result);
        if (result.success) {
          const entityId = result.serverId ?? (op.payload?.id as string | undefined);
          if (entityId) {
            eventsToRecord.push({
              entity: op.entity,
              entityId,
              operation: op.operation,
              payload: op.payload,
            });
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.push({ success: false, error: message });
      }
    }
    if (eventsToRecord.length > 0) {
      await this.recordSyncEventsBatch(branchId, eventsToRecord);
    }
    return results;
  }

  private async applyOne(
    branchId: string,
    currentUserRole: UserRole,
    allowedBranches: string[],
    op: SyncOperationInput,
  ): Promise<SyncPushResult> {
    const { entity, operation, payload, clientId } = op;

    if (entity === 'staff') {
      if (operation === 'create') {
        const dto = payload as unknown as CreateStaffDto;
        const user = await this.staffService.create(currentUserRole, branchId || null, dto);
        return { success: true, serverId: user.id };
      }
      if (operation === 'update') {
        const id = payload.id as string;
        if (!id) throw new BadRequestException('Staff update requires id');
        const dto = payload as unknown as UpdateStaffDto;
        await this.staffService.update(currentUserRole, branchId || null, allowedBranches, id, dto);
        return { success: true };
      }
      if (operation === 'delete') {
        const id = payload.id as string;
        if (!id) throw new BadRequestException('Staff delete requires id');
        await this.staffService.remove(currentUserRole, branchId || null, allowedBranches, id);
        return { success: true };
      }
    }

    if (entity === 'staffSchedule' && operation === 'update') {
      const userId = payload.userId as string;
      const slots = payload.slots as Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
      if (!userId || !Array.isArray(slots)) throw new BadRequestException('staffSchedule update requires userId and slots');
      await this.staffScheduleService.setSchedule(branchId, userId, slots);
      return { success: true };
    }

    if (entity === 'staffAttendance' && (operation === 'create' || operation === 'update')) {
      const userId = payload.userId as string;
      const date = payload.date as string;
      const checkInAt = payload.checkInAt as string | undefined;
      const checkOutAt = payload.checkOutAt as string | undefined;
      if (!userId || !date) throw new BadRequestException('staffAttendance requires userId and date');
      await this.staffAttendanceService.upsert(branchId, userId, {
        date,
        checkInAt: checkInAt ?? null,
        checkOutAt: checkOutAt ?? null,
      });
      return { success: true };
    }

    if (entity === 'staffLeave') {
      if (operation === 'create') {
        const dto = payload as { userId: string; fromDate: string; toDate: string; type?: string; notes?: string | null };
        const leave = await this.staffLeaveService.create(branchId, { ...dto, branchId });
        return { success: true, serverId: leave.id };
      }
      if (operation === 'update') {
        const id = payload.id as string;
        if (!id) throw new BadRequestException('staffLeave update requires id');
        const dto = payload as { fromDate?: string; toDate?: string; type?: string; status?: string; notes?: string | null };
        await this.staffLeaveService.update(branchId, id, dto);
        return { success: true };
      }
      if (operation === 'delete') {
        const id = payload.id as string;
        if (!id) throw new BadRequestException('staffLeave delete requires id');
        await this.staffLeaveService.remove(branchId, id);
        return { success: true };
      }
    }

    if (entity === 'doctorCommissionRate' && operation === 'update') {
      const doctorId = payload.doctorId as string;
      const ratePercent = payload.ratePercent as number;
      if (!doctorId || ratePercent === undefined) throw new BadRequestException('doctorCommissionRate update requires doctorId and ratePercent');
      await this.doctorCommissionService.setRate(branchId, doctorId, { ratePercent });
      return { success: true };
    }

    throw new BadRequestException(`Unknown sync entity/operation: ${entity}/${operation}`);
  }

  private async recordSyncEventsBatch(
    branchId: string,
    events: Array<{ entity: string; entityId: string; operation: 'create' | 'update' | 'delete'; payload: Record<string, unknown> }>,
  ): Promise<void> {
    const entities = events.map((e) =>
      this.syncEventRepo.create({
        entity: e.entity,
        entityId: e.entityId,
        operation: e.operation,
        payload: e.payload,
        branchId,
      }),
    );
    await this.syncEventRepo.save(entities);
  }

  async pull(branchId: string, lastSyncedAt?: string): Promise<SyncEvent[]> {
    const qb = this.syncEventRepo
      .createQueryBuilder('e')
      .where('e.branchId = :branchId', { branchId })
      .orderBy('e.createdAt', 'ASC');
    if (lastSyncedAt) {
      qb.andWhere('e.createdAt > :lastSyncedAt', { lastSyncedAt });
    }
    return qb.getMany();
  }
}
