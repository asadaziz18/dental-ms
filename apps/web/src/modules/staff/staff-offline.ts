/**
 * Dexie-backed offline layer for staff.
 * - Persist API responses to IndexedDB
 * - Read from IndexedDB when offline or as fallback
 * - Enqueue mutations to syncQueue for background sync
 */
import { db } from '@/core/db/schema';
import type {
  StaffRecord,
  StaffScheduleRecord,
  StaffAttendanceRecord,
  StaffLeaveRecord,
  DoctorCommissionRateRecord,
} from '@/core/db/schema';
import type { SyncStatus } from '@dental-ms/shared-types';
import type {
  Staff,
  StaffScheduleSlot,
  StaffAttendanceRecord as ApiAttendance,
  StaffLeaveRecord as ApiLeave,
  DoctorCommissionRateRecord as ApiCommissionRate,
  CreateStaffInput,
  UpdateStaffInput,
  UpsertStaffScheduleDto,
  CreateOrUpdateAttendanceDto,
  CreateStaffLeaveDto,
  UpdateStaffLeaveDto,
  SetCommissionRateDto,
} from '@dental-ms/shared-types';

const SYNC_STATUS_DEFAULT: SyncStatus = 'synced';

function now(): string {
  return new Date().toISOString();
}

// ---- Staff (directory) ----

export function toStaffRecord(
  s: Staff,
  syncStatus: SyncStatus = SYNC_STATUS_DEFAULT,
): StaffRecord {
  return {
    serverId: s.id,
    branchId: s.branchId,
    email: s.email,
    fullName: s.fullName,
    role: s.role,
    isActive: s.isActive,
    updatedAt: s.updatedAt,
    createdAt: s.createdAt,
    _syncStatus: syncStatus,
  };
}

export function toStaff(r: StaffRecord): Staff {
  return {
    id: r.serverId,
    email: r.email,
    fullName: r.fullName,
    role: r.role,
    branchId: r.branchId,
    isActive: r.isActive,
    createdAt: r.createdAt ?? r.updatedAt,
    updatedAt: r.updatedAt,
    branch: undefined,
  };
}

/** Merge API list into Dexie; does not remove pending (unsynced) records */
export async function persistStaffList(list: Staff[]): Promise<void> {
  for (const s of list) {
    await persistStaff(s);
  }
}

export async function getStaffListFromDexie(branchIdFilter?: string): Promise<Staff[]> {
  const rows = branchIdFilter
    ? await db.staff.where('branchId').equals(branchIdFilter).toArray()
    : await db.staff.toArray();
  rows.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  return rows.map(toStaff);
}

export async function persistStaff(s: Staff): Promise<void> {
  const record = toStaffRecord(s);
  const existing = await db.staff.where('serverId').equals(s.id).first();
  if (existing?.id != null) {
    await db.staff.update(existing.id, record);
  } else {
    await db.staff.add(record as StaffRecord);
  }
}

export async function getStaffFromDexie(serverId: string): Promise<Staff | null> {
  const r = await db.staff.where('serverId').equals(serverId).first();
  return r ? toStaff(r) : null;
}

export async function addStaffOptimistic(
  body: CreateStaffInput,
): Promise<StaffRecord> {
  const tempId = `temp-staff-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record: StaffRecord = {
    serverId: tempId,
    branchId: body.branchId ?? null,
    email: body.email,
    fullName: body.fullName,
    role: body.role,
    isActive: body.isActive ?? true,
    updatedAt: now(),
    _syncStatus: 'pending',
  };
  await db.staff.add(record as StaffRecord);
  return record;
}

export async function updateStaffInDexie(
  serverId: string,
  updates: Partial<Pick<StaffRecord, 'serverId' | 'email' | 'fullName' | 'role' | 'branchId' | 'isActive' | 'updatedAt' | '_syncStatus'>>,
): Promise<void> {
  const existing = await db.staff.where('serverId').equals(serverId).first();
  if (existing?.id != null) {
    await db.staff.update(existing.id, updates);
  }
}

export async function replaceStaffServerId(oldServerId: string, newServerId: string): Promise<void> {
  const existing = await db.staff.where('serverId').equals(oldServerId).first();
  if (existing?.id != null) {
    await db.staff.update(existing.id, {
      serverId: newServerId,
      _syncStatus: 'synced' as SyncStatus,
      updatedAt: now(),
    });
  }
}

export async function removeStaffFromDexie(serverId: string): Promise<void> {
  await db.staff.where('serverId').equals(serverId).delete();
}

// ---- Sync queue ----

export async function enqueueSync(
  entity: string,
  operation: 'create' | 'update' | 'delete',
  payload: Record<string, unknown>,
): Promise<void> {
  await db.syncQueue.add({
    entity,
    operation,
    payload,
    createdAt: now(),
    retryCount: 0,
  });
}

// ---- Schedules ----

export function toScheduleRecord(
  s: StaffScheduleSlot,
  syncStatus: SyncStatus = SYNC_STATUS_DEFAULT,
): StaffScheduleRecord {
  return {
    serverId: s.id,
    branchId: s.branchId,
    userId: s.userId,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    updatedAt: (s as { updatedAt?: string }).updatedAt ?? now(),
    _syncStatus: syncStatus,
  };
}

export async function persistScheduleList(userId: string, branchId: string, slots: StaffScheduleSlot[]): Promise<void> {
  await db.staffSchedules.where('userId').equals(userId).filter((r) => r.branchId === branchId).delete();
  if (slots.length > 0) {
    const records = slots.map((s) => toScheduleRecord(s));
    await db.staffSchedules.bulkAdd(records as StaffScheduleRecord[]);
  }
}

export async function getScheduleFromDexie(userId: string, branchId: string): Promise<StaffScheduleSlot[]> {
  const rows = await db.staffSchedules
    .where('userId')
    .equals(userId)
    .filter((r) => r.branchId === branchId)
    .sortBy('dayOfWeek');
  return rows.map((r) => ({
    id: r.serverId,
    branchId: r.branchId,
    userId: r.userId,
    dayOfWeek: r.dayOfWeek,
    startTime: r.startTime,
    endTime: r.endTime,
  }));
}

// ---- Attendance ----

export function toAttendanceRecord(
  a: ApiAttendance,
  syncStatus: SyncStatus = SYNC_STATUS_DEFAULT,
): StaffAttendanceRecord {
  return {
    serverId: a.id,
    branchId: a.branchId,
    userId: a.userId,
    date: a.date,
    checkInAt: a.checkInAt,
    checkOutAt: a.checkOutAt,
    updatedAt: (a as { updatedAt?: string }).updatedAt ?? now(),
    _syncStatus: syncStatus,
  };
}

export async function persistAttendanceList(list: ApiAttendance[]): Promise<void> {
  if (list.length === 0) return;
  const records = list.map((a) => toAttendanceRecord(a));
  for (const r of records) {
    const existing = await db.staffAttendance
      .where('userId')
      .equals(r.userId)
      .filter((x) => x.branchId === r.branchId && x.date === r.date)
      .first();
    if (existing?.id != null) {
      await db.staffAttendance.update(existing.id, r);
    } else {
      await db.staffAttendance.add(r as StaffAttendanceRecord);
    }
  }
}

export async function getAttendanceFromDexie(
  userId: string,
  _params?: { fromDate?: string; toDate?: string },
): Promise<ApiAttendance[]> {
  const rows = await db.staffAttendance.where('userId').equals(userId).sortBy('date');
  return rows.map((r) => ({
    id: r.serverId,
    branchId: r.branchId,
    userId: r.userId,
    date: r.date,
    checkInAt: r.checkInAt,
    checkOutAt: r.checkOutAt,
    user: undefined,
  }));
}

// ---- Leaves ----

export function toLeaveRecord(
  l: ApiLeave,
  syncStatus: SyncStatus = SYNC_STATUS_DEFAULT,
): StaffLeaveRecord {
  return {
    serverId: l.id,
    userId: l.userId,
    branchId: l.branchId,
    fromDate: l.fromDate,
    toDate: l.toDate,
    type: l.type,
    status: l.status,
    notes: l.notes,
    updatedAt: (l as { updatedAt?: string }).updatedAt ?? now(),
    _syncStatus: syncStatus,
  };
}

export async function persistLeaveList(list: ApiLeave[]): Promise<void> {
  if (list.length === 0) return;
  for (const l of list) {
    const record = toLeaveRecord(l);
    const existing = await db.staffLeaves.where('serverId').equals(l.id).first();
    if (existing?.id != null) {
      await db.staffLeaves.update(existing.id, record);
    } else {
      await db.staffLeaves.add(record as StaffLeaveRecord);
    }
  }
}

export async function getLeavesFromDexieByUser(userId: string): Promise<ApiLeave[]> {
  const rows = await db.staffLeaves.where('userId').equals(userId).sortBy('fromDate');
  return rows.map((r) => ({
    id: r.serverId,
    userId: r.userId,
    branchId: r.branchId,
    fromDate: r.fromDate,
    toDate: r.toDate,
    type: r.type,
    status: r.status,
    notes: r.notes,
    user: undefined,
  }));
}

// ---- Commission rate (read-only cache; set rate is API-only for now) ----

export async function persistCommissionRate(r: ApiCommissionRate | null, doctorId: string, branchId: string): Promise<void> {
  await db.doctorCommissionRates.where('doctorId').equals(doctorId).filter((x) => x.branchId === branchId).delete();
  if (r) {
    await db.doctorCommissionRates.add({
      serverId: r.id,
      branchId: r.branchId,
      doctorId: r.doctorId,
      ratePercent: r.ratePercent,
      updatedAt: (r as { updatedAt?: string }).updatedAt ?? now(),
      _syncStatus: 'synced' as SyncStatus,
    } as DoctorCommissionRateRecord);
  }
}

export async function getCommissionRateFromDexie(doctorId: string): Promise<ApiCommissionRate | null> {
  const r = await db.doctorCommissionRates.where('doctorId').equals(doctorId).first();
  return r
    ? {
        id: r.serverId,
        branchId: r.branchId,
        doctorId: r.doctorId,
        ratePercent: r.ratePercent,
        doctor: undefined,
      }
    : null;
}
