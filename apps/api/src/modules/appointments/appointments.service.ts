import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { User } from '../../database/entities/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentsGateway } from './appointments.gateway';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly gateway: AppointmentsGateway,
  ) {}

  async getDoctors(branchId: string): Promise<{ id: string; fullName: string }[]> {
    const users = await this.userRepo.find({
      where: { branchId, role: 'Doctor', isActive: true },
      select: ['id', 'fullName'],
    });
    return users;
  }

  async create(branchId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    const start = new Date(dto.start);
    const end = new Date(dto.end);
    if (end <= start) {
      throw new BadRequestException('end must be after start');
    }
    await this.assertNoConflict(branchId, {
      doctorId: dto.doctorId ?? null,
      chair: dto.chair ?? null,
      start,
      end,
      excludeId: null,
    });
    const appointment = this.repo.create({
      ...dto,
      branchId,
      start,
      end,
      status: dto.status ?? 'Scheduled',
      sendReminder: dto.sendReminder ?? true,
    });
    const saved = await this.repo.save(appointment);
    const full = await this.findOne(branchId, saved.id);
    this.gateway.emitAppointmentUpdated(branchId, full);
    return full;
  }

  async findAll(
    branchId: string,
    query: AppointmentQueryDto,
  ): Promise<Appointment[]> {
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'patient')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .where('a.branchId = :branchId', { branchId });

    if (query.start && query.end) {
      qb.andWhere('a.start >= :start AND a.end <= :end', {
        start: query.start,
        end: query.end,
      });
    } else if (query.date) {
      const day = new Date(query.date);
      const startOfDay = new Date(day);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setUTCHours(23, 59, 59, 999);
      qb.andWhere('a.start >= :start AND a.end <= :end', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      });
    }
    if (query.doctorId) {
      qb.andWhere('a.doctorId = :doctorId', { doctorId: query.doctorId });
    }
    qb.orderBy('a.start', 'ASC');
    return qb.getMany();
  }

  async findOne(branchId: string, id: string): Promise<Appointment> {
    const appointment = await this.repo.findOne({
      where: { id, branchId },
      relations: ['patient', 'doctor'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async updateStatus(
    branchId: string,
    id: string,
    dto: UpdateStatusDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(branchId, id);
    appointment.status = dto.status as Appointment['status'];
    await this.repo.save(appointment);
    const full = await this.findOne(branchId, id);
    this.gateway.emitAppointmentUpdated(branchId, full);
    return full;
  }

  async remove(branchId: string, id: string): Promise<void> {
    const appointment = await this.findOne(branchId, id);
    await this.repo.remove(appointment);
    // No real-time emit on delete; clients refetch on next navigation or can listen for appointment:deleted if we add it later.
  }

  private async assertNoConflict(
    branchId: string,
    params: {
      doctorId: string | null;
      chair: string | null;
      start: Date;
      end: Date;
      excludeId: string | null;
    },
  ): Promise<void> {
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.branchId = :branchId', { branchId })
      .andWhere(
        '(a.start < :end AND a.end > :start)',
        { start: params.start, end: params.end },
      );
    if (params.excludeId) {
      qb.andWhere('a.id != :excludeId', { excludeId: params.excludeId });
    }
    const overlapping = await qb.getMany();
    if (params.doctorId) {
      const doctorConflict = overlapping.find((a) => a.doctorId === params.doctorId);
      if (doctorConflict) {
        throw new ConflictException(
          `Doctor is already booked from ${doctorConflict.start.toISOString()} to ${doctorConflict.end.toISOString()}`,
        );
      }
    }
    if (params.chair) {
      const chairConflict = overlapping.find((a) => a.chair === params.chair);
      if (chairConflict) {
        throw new ConflictException(
          `Chair/room "${params.chair}" is already in use in this time range`,
        );
      }
    }
  }

  /** Emit to branch room (e.g. after external update). */
  emitUpdated(branchId: string, appointment: Appointment): void {
    this.gateway.emitAppointmentUpdated(branchId, appointment);
  }
}
