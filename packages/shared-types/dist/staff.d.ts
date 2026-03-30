/** Same as UserRole from index; avoid circular import */
export type StaffRole = 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse';
/** Staff member (User without password) */
export interface Staff {
    id: string;
    email: string;
    fullName: string;
    role: StaffRole;
    branchId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    branch?: {
        id: string;
        name: string;
    } | null;
}
export interface StaffScheduleSlot {
    id: string;
    branchId: string;
    userId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
export interface StaffAttendanceRecord {
    id: string;
    branchId: string;
    userId: string;
    date: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    user?: {
        id: string;
        fullName: string;
    };
}
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export interface StaffLeaveRecord {
    id: string;
    userId: string;
    branchId: string;
    fromDate: string;
    toDate: string;
    type: LeaveType;
    status: LeaveStatus;
    notes: string | null;
    user?: {
        id: string;
        fullName: string;
    };
}
export interface DoctorCommissionRateRecord {
    id: string;
    branchId: string;
    doctorId: string;
    ratePercent: string;
    doctor?: {
        id: string;
        fullName: string;
    };
}
export interface CommissionSummaryItem {
    doctorId: string;
    doctorName: string;
    totalRevenue: number;
    ratePercent: number;
    commission: number;
}
/** DTOs for create/update */
export interface CreateStaffInput {
    email: string;
    password: string;
    fullName: string;
    role: StaffRole;
    branchId?: string | null;
    isActive?: boolean;
}
export interface UpdateStaffInput {
    email?: string;
    password?: string;
    fullName?: string;
    role?: StaffRole;
    branchId?: string | null;
    isActive?: boolean;
}
export interface UpsertStaffScheduleDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
export interface CreateOrUpdateAttendanceDto {
    date: string;
    checkInAt?: string | null;
    checkOutAt?: string | null;
}
export interface CreateStaffLeaveDto {
    userId: string;
    fromDate: string;
    toDate: string;
    type?: LeaveType;
    notes?: string | null;
}
export interface UpdateStaffLeaveDto {
    fromDate?: string;
    toDate?: string;
    type?: LeaveType;
    status?: LeaveStatus;
    notes?: string | null;
}
export interface SetCommissionRateDto {
    ratePercent: number;
}
//# sourceMappingURL=staff.d.ts.map