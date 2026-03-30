import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async create(dto: CreatePlanDto) {
    const existing = await this.planRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Plan slug already exists');
    const plan = this.planRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      priceMonthly: String(dto.priceMonthly ?? 0),
      priceYearly: String(dto.priceYearly ?? 0),
      billingInterval: dto.billingInterval ?? 'month',
      features: dto.features ?? null,
      isActive: dto.isActive ?? true,
    });
    return this.planRepo.save(plan);
  }

  async findAll(activeOnly?: boolean) {
    const where = activeOnly ? { isActive: true } : {};
    return this.planRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findOne(id);
    if (dto.slug !== undefined) {
      const existing = await this.planRepo.findOne({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) throw new ConflictException('Plan slug already exists');
      plan.slug = dto.slug;
    }
    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.priceMonthly !== undefined) plan.priceMonthly = String(dto.priceMonthly);
    if (dto.priceYearly !== undefined) plan.priceYearly = String(dto.priceYearly);
    if (dto.billingInterval !== undefined) plan.billingInterval = dto.billingInterval;
    if (dto.features !== undefined) plan.features = dto.features;
    if (dto.isActive !== undefined) plan.isActive = dto.isActive;
    return this.planRepo.save(plan);
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    await this.planRepo.remove(plan);
    return { deleted: true };
  }
}
