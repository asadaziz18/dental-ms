import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlansService {
    private readonly planRepo;
    constructor(planRepo: Repository<SubscriptionPlan>);
    create(dto: CreatePlanDto): Promise<SubscriptionPlan>;
    findAll(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
    findOne(id: string): Promise<SubscriptionPlan>;
    update(id: string, dto: UpdatePlanDto): Promise<SubscriptionPlan>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
