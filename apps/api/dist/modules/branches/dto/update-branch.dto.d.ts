import { CreateBranchDto } from './create-branch.dto';
declare const UpdateBranchDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBranchDto>>;
export declare class UpdateBranchDto extends UpdateBranchDto_base {
    openingTime?: string;
    closingTime?: string;
    workingDays?: string[];
}
export {};
