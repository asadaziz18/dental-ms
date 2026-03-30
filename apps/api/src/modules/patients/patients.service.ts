import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../database/entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import type { TimelineEvent } from '@dental-ms/shared-types';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly repo: Repository<Patient>,
  ) {}

  async create(branchId: string, dto: CreatePatientDto): Promise<Patient> {
    const patient = this.repo.create({ ...dto, branchId });
    const saved = await this.repo.save(patient);
    return this.repo.findOneByOrFail({ id: saved.id });
  }

  async findAll(
    branchId: string,
    query: PatientQueryDto,
  ): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const { search, page = 1, limit = 20 } = query;
    const qb = this.repo
      .createQueryBuilder('patient')
      .where('patient.branchId = :branchId', { branchId })
      .andWhere('patient.deletedAt IS NULL');

    if (search?.trim()) {
      const like = `%${search.trim()}%`;
      qb.andWhere(
        `(
          patient."firstName" ILIKE :like
          OR patient."lastName" ILIKE :like
          OR patient.phone ILIKE :like
          OR patient.email ILIKE :like
          OR patient."insuranceId" ILIKE :like
        )`,
        { like },
      );
    }

    const [data, total] = await qb
      .orderBy('patient.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(branchId: string, id: string): Promise<Patient> {
    const patient = await this.repo.findOne({
      where: { id, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(
    branchId: string,
    id: string,
    dto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(branchId, id);
    Object.assign(patient, dto);
    await this.repo.save(patient);
    return this.findOne(branchId, id);
  }

  async remove(branchId: string, id: string, deletedBy?: string): Promise<void> {
    const patient = await this.findOne(branchId, id);
    (patient as { deletedBy?: string | null }).deletedBy = deletedBy ?? null;
    await this.repo.softRemove(patient);
  }

  async getTimeline(
    branchId: string,
    patientId: string,
  ): Promise<{ patientId: string; events: TimelineEvent[] }> {
    await this.findOne(branchId, patientId);
    // Placeholder: appointments, treatments, payments will be joined in later phases
    const events: TimelineEvent[] = [];
    return { patientId, events };
  }
}
