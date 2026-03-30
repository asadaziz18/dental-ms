import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    create(dto: CreatePlanDto): Promise<import("../../database/entities").SubscriptionPlan>;
    findAll(activeOnly?: string): Promise<import("../../database/entities").SubscriptionPlan[]>;
    findOne(id: string): Promise<import("../../database/entities").SubscriptionPlan>;
    update(id: string, dto: UpdatePlanDto): Promise<import("../../database/entities").SubscriptionPlan>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
