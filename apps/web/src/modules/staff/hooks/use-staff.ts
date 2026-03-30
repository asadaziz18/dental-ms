import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBranchId } from '@/core/api/client';
import { syncPendingCountKey } from '@/shared/hooks/useSyncStatus';
import { staffApi } from '../api';
import {
  persistStaffList,
  getStaffListFromDexie,
  persistStaff,
  getStaffFromDexie,
  addStaffOptimistic,
  updateStaffInDexie,
  replaceStaffServerId,
  removeStaffFromDexie,
  enqueueSync,
  toStaff,
  persistScheduleList,
  getScheduleFromDexie,
  persistAttendanceList,
  getAttendanceFromDexie,
  persistLeaveList,
  getLeavesFromDexieByUser,
  persistCommissionRate,
  getCommissionRateFromDexie,
} from '../staff-offline';
import type {
  CreateStaffInput,
  UpdateStaffInput,
  UpsertStaffScheduleDto,
  CreateOrUpdateAttendanceDto,
  CreateStaffLeaveDto,
  UpdateStaffLeaveDto,
  SetCommissionRateDto,
} from '@dental-ms/shared-types';

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (branchId?: string) => [...staffKeys.lists(), branchId ?? 'all'] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  schedule: (userId: string) => [...staffKeys.detail(userId), 'schedule'] as const,
  attendance: (params?: { fromDate?: string; toDate?: string }) =>
    [...staffKeys.all, 'attendance', params] as const,
  attendanceByUser: (userId: string, params?: { fromDate?: string; toDate?: string }) =>
    [...staffKeys.all, 'attendance', userId, params] as const,
  leaves: (params?: { fromDate?: string; toDate?: string }) =>
    [...staffKeys.all, 'leaves', params] as const,
  leavesByUser: (userId: string) => [...staffKeys.all, 'leaves', userId] as const,
  leaveDetail: (id: string) => [...staffKeys.all, 'leave', id] as const,
  commissionSummary: (params?: { doctorId?: string; fromDate?: string; toDate?: string }) =>
    [...staffKeys.all, 'commission', 'summary', params] as const,
  commissionRate: (doctorId: string) => [...staffKeys.all, 'commission', 'rate', doctorId] as const,
};

/** Network-first; persist to Dexie on success; fallback to Dexie when offline or request fails */
export function useStaffListQuery(branchIdFilter?: string) {
  return useQuery({
    queryKey: staffKeys.list(branchIdFilter),
    queryFn: async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const data = await staffApi.list(branchIdFilter);
          await persistStaffList(data);
          return data;
        }
      } catch (_) {
        /* fall through to Dexie */
      }
      return getStaffListFromDexie(branchIdFilter);
    },
  });
}

/** Network-first; persist to Dexie on success; fallback to Dexie when offline or request fails */
export function useStaffQuery(id: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: staffKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const data = await staffApi.get(id!);
          await persistStaff(data);
          return data;
        }
      } catch (_) {
        /* fall through to Dexie */
      }
      const local = await getStaffFromDexie(id!);
      if (!local) throw new Error('Staff not found');
      return local;
    },
    enabled: !!id && (options?.enabled !== false),
  });
}

/** Optimistic Dexie write + sync queue; call API when online; replace temp id on success */
export function useCreateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateStaffInput) => {
      const record = await addStaffOptimistic(body);
      await enqueueSync('staff', 'create', { ...body, clientId: record.serverId } as unknown as Record<string, unknown>);
      const optimisticStaff = toStaff(record);
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const created = await staffApi.create(body);
          await replaceStaffServerId(record.serverId, created.id);
          await persistStaff(created);
          return created;
        }
      } catch (_) {
        /* leave pending in Dexie and queue */
      }
      return optimisticStaff;
    },
    onSuccess: (data) => {
      qc.setQueryData(staffKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: staffKeys.lists() });
      qc.invalidateQueries({ queryKey: syncPendingCountKey });
    },
  });
}

/** Optimistic Dexie update + sync queue; call API when online */
export function useUpdateStaffMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateStaffInput) => {
      const updates = {
        ...(body.email !== undefined && { email: body.email }),
        ...(body.fullName !== undefined && { fullName: body.fullName }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.branchId !== undefined && { branchId: body.branchId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        updatedAt: new Date().toISOString(),
      };
      await updateStaffInDexie(id, updates);
      await enqueueSync('staff', 'update', { id, ...body } as unknown as Record<string, unknown>);
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const updated = await staffApi.update(id, body);
          await persistStaff(updated);
          return updated;
        }
      } catch (_) {
        /* leave pending */
      }
      const local = await getStaffFromDexie(id);
      if (!local) throw new Error('Staff not found');
      return local;
    },
    onSuccess: (data) => {
      qc.setQueryData(staffKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: staffKeys.lists() });
      qc.invalidateQueries({ queryKey: syncPendingCountKey });
    },
  });
}

/** Remove from Dexie + sync queue; call API when online */
export function useDeleteStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await removeStaffFromDexie(id);
      await enqueueSync('staff', 'delete', { id } as unknown as Record<string, unknown>);
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          await staffApi.delete(id);
        } catch (_) {
          /* leave removed from Dexie; queue will retry */
        }
      }
    },
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: staffKeys.detail(id) });
      qc.invalidateQueries({ queryKey: staffKeys.lists() });
      qc.invalidateQueries({ queryKey: syncPendingCountKey });
    },
  });
}

/** Network-first; persist to Dexie on success; fallback to Dexie when offline (requires branchId from context) */
export function useStaffScheduleQuery(userId: string | undefined | null) {
  return useQuery({
    queryKey: staffKeys.schedule(userId ?? ''),
    queryFn: async () => {
      const branchId = getBranchId();
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine && userId) {
          const data = await staffApi.getSchedule(userId);
          if (branchId) await persistScheduleList(userId, branchId, data);
          return data;
        }
      } catch (_) {
        /* fall through to Dexie */
      }
      if (userId && branchId) return getScheduleFromDexie(userId, branchId);
      return [];
    },
    enabled: !!userId,
  });
}

/** Persist to Dexie optimistically + sync queue; call API when online */
export function useSetStaffScheduleMutation(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slots: UpsertStaffScheduleDto[]) => {
      const branchId = getBranchId();
      const optimisticSlots = slots.map((s, i) => ({
        id: `temp-sched-${userId}-${i}`,
        branchId: branchId ?? '',
        userId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
      if (branchId) await persistScheduleList(userId, branchId, optimisticSlots);
      await enqueueSync('staffSchedule', 'update', { userId, slots } as unknown as Record<string, unknown>);
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const data = await staffApi.setSchedule(userId, slots);
          if (branchId) await persistScheduleList(userId, branchId, data);
          return data;
        }
      } catch (_) {
        /* leave pending */
      }
      return optimisticSlots;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.schedule(userId) });
      qc.invalidateQueries({ queryKey: syncPendingCountKey });
    },
  });
}

/** Network-first; persist to Dexie on success; fallback to Dexie when offline */
export function useAttendanceQuery(params?: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: staffKeys.attendance(params),
    queryFn: async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          const data = await staffApi.getAttendance(params ?? {});
          await persistAttendanceList(data);
          return data;
        }
      } catch (_) {
        /* fall through */
      }
      return []; // Dexie doesn't have branch-scoped attendance list without userId; keep list from API cache
    },
  });
}

/** Network-first; persist to Dexie on success; fallback to Dexie when offline */
export function useAttendanceByUserQuery(
  userId: string | undefined | null,
  params?: { fromDate?: string; toDate?: string },
) {
  return useQuery({
    queryKey: staffKeys.attendanceByUser(userId ?? '', params),
    queryFn: async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine && userId) {
          const data = await staffApi.getAttendanceByUser(userId, params ?? {});
          await persistAttendanceList(data);
          return data;
        }
      } catch (_) {
        /* fall through to Dexie */
      }
      if (userId) return getAttendanceFromDexie(userId, params);
      return [];
    },
    enabled: !!userId,
  });
}

export function useUpsertAttendanceMutation(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateOrUpdateAttendanceDto) => {
      await enqueueSync('staffAttendance', 'upsert', { userId, ...dto } as unknown as Record<string, unknown>);
      const data = await staffApi.upsertAttendance(userId, dto);
      await persistAttendanceList([data]);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.attendance() });
      qc.invalidateQueries({ queryKey: staffKeys.attendanceByUser(userId) });
      qc.invalidateQueries({ queryKey: syncPendingCountKey });
    },
  });
}

/** Network-first; persist to Dexie on success; fallback to Dexie when offline */
export function useLeavesQuery(params?: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: staffKeys.leaves(params),
    queryFn: () => staffApi.getLeaves(params),
  });
}

/** Network-first; persist to Dexie on success; fallback to Dexie when offline */
export function useLeavesByUserQuery(userId: string | undefined | null) {
  return useQuery({
    queryKey: staffKeys.leavesByUser(userId ?? ''),
    queryFn: async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine && userId) {
          const data = await staffApi.getLeavesByUser(userId);
          await persistLeaveList(data);
          return data;
        }
      } catch (_) {
        /* fall through to Dexie */
      }
      if (userId) return getLeavesFromDexieByUser(userId);
      return [];
    },
    enabled: !!userId,
  });
}

export function useLeaveQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: staffKeys.leaveDetail(id ?? ''),
    queryFn: () => staffApi.getLeave(id!),
    enabled: !!id,
  });
}

export function useCreateLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStaffLeaveDto) => staffApi.createLeave(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.leaves() });
    },
  });
}

export function useUpdateLeaveMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateStaffLeaveDto) => staffApi.updateLeave(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.leaves() });
      qc.invalidateQueries({ queryKey: staffKeys.leaveDetail(id) });
    },
  });
}

export function useDeleteLeaveMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.deleteLeave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.leaves() });
    },
  });
}

/** Network-first; commission summary is server-computed, cache in React Query only */
export function useCommissionSummaryQuery(params?: {
  doctorId?: string;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: staffKeys.commissionSummary(params),
    queryFn: () => staffApi.getCommissionSummary(params),
  });
}

/** Network-first; persist rate to Dexie on success; fallback to Dexie when offline */
export function useCommissionRateQuery(doctorId: string | undefined | null) {
  return useQuery({
    queryKey: staffKeys.commissionRate(doctorId ?? ''),
    queryFn: async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine && doctorId) {
          const data = await staffApi.getCommissionRate(doctorId);
          const branchId = getBranchId();
          if (branchId) await persistCommissionRate(data, doctorId, branchId);
          return data;
        }
      } catch (_) {
        /* fall through to Dexie */
      }
      if (doctorId) return getCommissionRateFromDexie(doctorId);
      return null;
    },
    enabled: !!doctorId,
  });
}

export function useSetCommissionRateMutation(doctorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: SetCommissionRateDto) => {
      await enqueueSync('doctorCommissionRate', 'update', { doctorId, ...dto } as unknown as Record<string, unknown>);
      const data = await staffApi.setCommissionRate(doctorId, dto);
      const branchId = getBranchId();
      if (branchId) await persistCommissionRate(data, doctorId, branchId);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.commissionRate(doctorId) });
      qc.invalidateQueries({ queryKey: staffKeys.commissionSummary() });
      qc.invalidateQueries({ queryKey: syncPendingCountKey });
    },
  });
}
