import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../../database/entities/prescription.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly repo: Repository<Prescription>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async findByPatient(branchId: string, patientId: string) {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.repo.find({
      where: { patientId },
      relations: ['prescribedBy', 'treatmentPlan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(patientId: string, id: string) {
    const rx = await this.repo.findOne({
      where: { id, patientId },
      relations: ['prescribedBy', 'treatmentPlan', 'patient'],
    });
    if (!rx) throw new NotFoundException('Prescription not found');
    return rx;
  }

  async create(
    branchId: string,
    prescribedById: string,
    dto: CreatePrescriptionDto,
  ) {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId, branchId },
    });
    if (!patient) throw new BadRequestException('Patient not found in this branch');
    const rx = this.repo.create({
      patientId: dto.patientId,
      treatmentPlanId: dto.treatmentPlanId ?? null,
      prescribedById,
      items: dto.items,
      notes: dto.notes ?? null,
    });
    return this.repo.save(rx);
  }

  async update(patientId: string, id: string, dto: UpdatePrescriptionDto) {
    const rx = await this.findOne(patientId, id);
    if (dto.treatmentPlanId !== undefined) rx.treatmentPlanId = dto.treatmentPlanId;
    if (dto.items !== undefined) rx.items = dto.items as any;
    if (dto.notes !== undefined) rx.notes = dto.notes;
    return this.repo.save(rx);
  }

  async remove(patientId: string, id: string) {
    const rx = await this.findOne(patientId, id);
    await this.repo.remove(rx);
    return { success: true };
  }
}
