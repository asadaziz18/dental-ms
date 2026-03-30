import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentPlan } from '../../database/entities/treatment-plan.entity';
import {
  TreatmentPlanItem,
  type ToothCondition,
} from '../../database/entities/treatment-plan-item.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';
import { CreateTreatmentPlanItemDto } from './dto/create-treatment-plan-item.dto';
import { UpdateTreatmentPlanItemDto } from './dto/update-treatment-plan-item.dto';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(TreatmentPlan)
    private readonly planRepo: Repository<TreatmentPlan>,
    @InjectRepository(TreatmentPlanItem)
    private readonly itemRepo: Repository<TreatmentPlanItem>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async findByPatient(branchId: string, patientId: string) {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.planRepo.find({
      where: { patientId, branchId },
      relations: ['items', 'items.procedure', 'doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(branchId: string, id: string) {
    const plan = await this.planRepo.findOne({
      where: { id, branchId },
      relations: ['items', 'items.procedure', 'items.doctor', 'doctor', 'patient'],
    });
    if (!plan) throw new NotFoundException('Treatment plan not found');
    return plan;
  }

  async create(branchId: string, dto: CreateTreatmentPlanDto) {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId, branchId },
    });
    if (!patient) throw new BadRequestException('Patient not found in this branch');
    const plan = this.planRepo.create({
      patientId: dto.patientId,
      branchId,
      status: (dto.status as 'Planned') ?? 'Planned',
      doctorId: dto.doctorId ?? null,
      clinicalNotes: dto.clinicalNotes ?? null,
    });
    return this.planRepo.save(plan);
  }

  async update(branchId: string, id: string, dto: UpdateTreatmentPlanDto) {
    const plan = await this.findOne(branchId, id);
    if (dto.status !== undefined) plan.status = dto.status as any;
    if (dto.doctorId !== undefined) plan.doctorId = dto.doctorId;
    if (dto.clinicalNotes !== undefined) plan.clinicalNotes = dto.clinicalNotes;
    return this.planRepo.save(plan);
  }

  async remove(branchId: string, id: string) {
    const plan = await this.findOne(branchId, id);
    await this.planRepo.remove(plan);
    return { success: true };
  }

  async addItem(
    branchId: string,
    treatmentPlanId: string,
    dto: CreateTreatmentPlanItemDto,
  ) {
    const plan = await this.findOne(branchId, treatmentPlanId);
    const item = this.itemRepo.create({
      treatmentPlanId: plan.id,
      toothNumber: dto.toothNumber,
      procedureId: dto.procedureId,
      conditionTag: (dto.conditionTag ?? null) as ToothCondition | null,
      status: dto.status ?? 'Planned',
      doctorId: dto.doctorId ?? null,
      estimatedCost: dto.estimatedCost != null ? String(dto.estimatedCost) : null,
      priority: dto.priority ?? 0,
    });
    return this.itemRepo.save(item);
  }

  async updateItem(
    branchId: string,
    treatmentPlanId: string,
    itemId: string,
    dto: UpdateTreatmentPlanItemDto,
  ) {
    await this.findOne(branchId, treatmentPlanId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, treatmentPlanId },
    });
    if (!item) throw new NotFoundException('Treatment plan item not found');
    if (dto.toothNumber !== undefined) item.toothNumber = dto.toothNumber;
    if (dto.procedureId !== undefined) item.procedureId = dto.procedureId;
    if (dto.conditionTag !== undefined) item.conditionTag = dto.conditionTag as any;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.doctorId !== undefined) item.doctorId = dto.doctorId;
    if (dto.estimatedCost !== undefined)
      item.estimatedCost = dto.estimatedCost != null ? String(dto.estimatedCost) : null;
    if (dto.priority !== undefined) item.priority = dto.priority;
    return this.itemRepo.save(item);
  }

  async removeItem(branchId: string, treatmentPlanId: string, itemId: string) {
    await this.findOne(branchId, treatmentPlanId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, treatmentPlanId },
    });
    if (!item) throw new NotFoundException('Treatment plan item not found');
    await this.itemRepo.remove(item);
    return { success: true };
  }
}
