import { User } from '../../../database/entities/user.entity';
export interface RequestUser {
    userId: string;
    email: string;
    role: string;
    branchId: string | null;
    allowedBranches: string[];
    user: User;
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof RequestUser | undefined)[]) => ParameterDecorator;
