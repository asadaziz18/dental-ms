export declare class CreateBranchDto {
    name: string;
    code: string;
    address: string;
    city: string;
    phone: string;
    email?: string | null;
    managerUserId?: string | null;
    openingTime: string;
    closingTime: string;
    workingDays: string[];
    isActive?: boolean;
}
export declare class CreateSubBranchDto extends CreateBranchDto {
}
