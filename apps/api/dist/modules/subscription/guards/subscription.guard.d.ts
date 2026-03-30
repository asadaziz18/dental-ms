import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BranchSubscription } from '../../../database/entities/branch-subscription.entity';
export declare class SubscriptionGuard implements CanActivate {
    private readonly subRepo;
    constructor(subRepo: Repository<BranchSubscription>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
