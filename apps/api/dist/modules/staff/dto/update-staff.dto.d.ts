declare const ROLES: readonly ["SuperAdmin", "BranchAdmin", "Doctor", "Receptionist", "Nurse"];
export declare class UpdateStaffDto {
    email?: string;
    password?: string;
    fullName?: string;
    role?: (typeof ROLES)[number];
    branchId?: string | null;
    isActive?: boolean;
}
export {};
