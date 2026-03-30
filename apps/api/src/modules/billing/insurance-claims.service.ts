import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceClaim } from '../../database/entities/insurance-claim.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { UpdateInsuranceClaimDto } from './dto/update-insurance-claim.dto';

@Injectable()
export class InsuranceClaimsService {
  constructor(
    @InjectRepository(InsuranceClaim)
    private readonly claimRepo: Repository<InsuranceClaim>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async findByPatient(branchId: string, patientId: string): Promise<InsuranceClaim[]> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.claimRepo.find({
      where: { patientId, branchId },
      relations: ['invoice'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<InsuranceClaim> {
    const claim = await this.claimRepo.findOne({
      where: { id, branchId },
      relations: ['patient', 'invoice'],
    });
    if (!claim) throw new NotFoundException('Insurance claim not found');
    return claim;
  }

  async create(branchId: string, dto: CreateInsuranceClaimDto): Promise<InsuranceClaim> {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId, branchId },
    });
    if (!patient) throw new BadRequestException('Patient not found in this branch');

    const claim = this.claimRepo.create({
      patientId: dto.patientId,
      branchId,
      invoiceId: dto.invoiceId ?? null,
      claimNumber: dto.claimNumber ?? null,
      status: (dto.status as InsuranceClaim['status']) ?? 'Draft',
      insuranceProvider: dto.insuranceProvider ?? null,
      submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
      amountClaimed: dto.amountClaimed != null ? String(dto.amountClaimed) : null,
      amountApproved: dto.amountApproved != null ? String(dto.amountApproved) : null,
      notes: dto.notes ?? null,
    });
    return this.claimRepo.save(claim);
  }

  async update(
    branchId: string,
    id: string,
    dto: UpdateInsuranceClaimDto,
  ): Promise<InsuranceClaim> {
    const claim = await this.findOne(branchId, id);
    if (dto.claimNumber !== undefined) claim.claimNumber = dto.claimNumber;
    if (dto.status !== undefined) claim.status = dto.status as InsuranceClaim['status'];
    if (dto.insuranceProvider !== undefined) claim.insuranceProvider = dto.insuranceProvider;
    if (dto.submittedAt !== undefined) claim.submittedAt = dto.submittedAt ? new Date(dto.submittedAt) : null;
    if (dto.amountClaimed !== undefined) claim.amountClaimed = dto.amountClaimed != null ? String(dto.amountClaimed) : null;
    if (dto.amountApproved !== undefined) claim.amountApproved = dto.amountApproved != null ? String(dto.amountApproved) : null;
    if (dto.notes !== undefined) claim.notes = dto.notes;
    return this.claimRepo.save(claim);
  }

  async remove(branchId: string, id: string): Promise<void> {
    const claim = await this.findOne(branchId, id);
    await this.claimRepo.remove(claim);
  }
}
