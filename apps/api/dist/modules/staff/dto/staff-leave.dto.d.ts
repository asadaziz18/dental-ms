export declare class CreateStaffLeaveDto {
    userId: string;
    fromDate: string;
    toDate: string;
    type?: string;
    notes?: string | null;
}
export declare class UpdateStaffLeaveDto {
    status?: string;
    notes?: string | null;
}
