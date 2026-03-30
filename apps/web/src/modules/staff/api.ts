import { api } from '@/core/api/client';
import type {
  Staff,
  StaffScheduleSlot,
  StaffAttendanceRecord,
  StaffLeaveRecord,
  DoctorCommissionRateRecord,
  CommissionSummaryItem,
  CreateStaffInput,
  UpdateStaffInput,
  UpsertStaffScheduleDto,
  CreateOrUpdateAttendanceDto,
  CreateStaffLeaveDto,
  UpdateStaffLeaveDto,
  SetCommissionRateDto,
} from '@dental-ms/shared-types';

const STAFF_BASE = '/staff';

export const staffApi = {
  list(branchIdFilter?: string): Promise<Staff[]> {
    const params = branchIdFilter ? `?branchId=${encodeURIComponent(branchIdFilter)}` : '';
    return api.get<Staff[]>(`${STAFF_BASE}${params}`).then((r) => r.data);
  },

  get(id: string): Promise<Staff> {
    return api.get<Staff>(`${STAFF_BASE}/${id}`).then((r) => r.data);
  },

  create(body: CreateStaffInput): Promise<Staff> {
    return api.post<Staff>(STAFF_BASE, body).then((r) => r.data);
  },

  update(id: string, body: UpdateStaffInput): Promise<Staff> {
    return api.patch<Staff>(`${STAFF_BASE}/${id}`, body).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${STAFF_BASE}/${id}`);
  },

  getSchedule(userId: string): Promise<StaffScheduleSlot[]> {
    return api
      .get<StaffScheduleSlot[]>(`${STAFF_BASE}/${userId}/schedule`)
      .then((r) => r.data);
  },

  setSchedule(userId: string, slots: UpsertStaffScheduleDto[]): Promise<StaffScheduleSlot[]> {
    return api
      .put<StaffScheduleSlot[]>(`${STAFF_BASE}/${userId}/schedule`, { slots })
      .then((r) => r.data);
  },

  getAttendance(params: { fromDate?: string; toDate?: string }): Promise<StaffAttendanceRecord[]> {
    const search = new URLSearchParams();
    if (params.fromDate) search.set('fromDate', params.fromDate);
    if (params.toDate) search.set('toDate', params.toDate);
    const q = search.toString() ? `?${search}` : '';
    return api.get<StaffAttendanceRecord[]>(`${STAFF_BASE}/attendance${q}`).then((r) => r.data);
  },

  getAttendanceByUser(
    userId: string,
    params: { fromDate?: string; toDate?: string },
  ): Promise<StaffAttendanceRecord[]> {
    const search = new URLSearchParams();
    if (params.fromDate) search.set('fromDate', params.fromDate);
    if (params.toDate) search.set('toDate', params.toDate);
    const q = search.toString() ? `?${search}` : '';
    return api
      .get<StaffAttendanceRecord[]>(`${STAFF_BASE}/attendance/user/${userId}${q}`)
      .then((r) => r.data);
  },

  upsertAttendance(userId: string, dto: CreateOrUpdateAttendanceDto): Promise<StaffAttendanceRecord> {
    return api
      .post<StaffAttendanceRecord>(`${STAFF_BASE}/attendance/user/${userId}`, dto)
      .then((r) => r.data);
  },

  getLeaves(params?: { fromDate?: string; toDate?: string }): Promise<StaffLeaveRecord[]> {
    const search = new URLSearchParams();
    if (params?.fromDate) search.set('fromDate', params.fromDate);
    if (params?.toDate) search.set('toDate', params.toDate);
    const q = search.toString() ? `?${search}` : '';
    return api.get<StaffLeaveRecord[]>(`${STAFF_BASE}/leaves${q}`).then((r) => r.data);
  },

  getLeavesByUser(userId: string): Promise<StaffLeaveRecord[]> {
    return api.get<StaffLeaveRecord[]>(`${STAFF_BASE}/leaves/user/${userId}`).then((r) => r.data);
  },

  getLeave(id: string): Promise<StaffLeaveRecord> {
    return api.get<StaffLeaveRecord>(`${STAFF_BASE}/leaves/${id}`).then((r) => r.data);
  },

  createLeave(dto: CreateStaffLeaveDto): Promise<StaffLeaveRecord> {
    return api.post<StaffLeaveRecord>(`${STAFF_BASE}/leaves`, dto).then((r) => r.data);
  },

  updateLeave(id: string, dto: UpdateStaffLeaveDto): Promise<StaffLeaveRecord> {
    return api.patch<StaffLeaveRecord>(`${STAFF_BASE}/leaves/${id}`, dto).then((r) => r.data);
  },

  deleteLeave(id: string): Promise<void> {
    return api.delete(`${STAFF_BASE}/leaves/${id}`);
  },

  getCommissionSummary(params?: {
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<CommissionSummaryItem[]> {
    const search = new URLSearchParams();
    if (params?.doctorId) search.set('doctorId', params.doctorId);
    if (params?.fromDate) search.set('fromDate', params.fromDate);
    if (params?.toDate) search.set('toDate', params.toDate);
    const q = search.toString() ? `?${search}` : '';
    return api
      .get<CommissionSummaryItem[]>(`${STAFF_BASE}/commission/summary${q}`)
      .then((r) => r.data);
  },

  getCommissionRate(doctorId: string): Promise<DoctorCommissionRateRecord | null> {
    return api
      .get<DoctorCommissionRateRecord | null>(`${STAFF_BASE}/commission/doctor/${doctorId}`)
      .then((r) => r.data);
  },

  setCommissionRate(doctorId: string, dto: SetCommissionRateDto): Promise<DoctorCommissionRateRecord> {
    return api
      .put<DoctorCommissionRateRecord>(`${STAFF_BASE}/commission/doctor/${doctorId}`, dto)
      .then((r) => r.data);
  },
};
