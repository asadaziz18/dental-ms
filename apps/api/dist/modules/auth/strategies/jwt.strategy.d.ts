import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import type { JwtPayload } from '@dental-ms/shared-types';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepo;
    constructor(config: ConfigService, userRepo: Repository<User>);
    validate(req: Request, payload: JwtPayload & {
        type?: string;
    }): Promise<{
        userId: string;
        email: string;
        role: import("@dental-ms/shared-types").UserRole;
        branchId: string | null;
        allowedBranches: string[];
        user: User;
    }>;
}
export {};
