import { Repository } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { User } from '../../database/entities/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { AppointmentsGateway } from './appointments.gateway';
export declare class AppointmentsService {
    private readonly repo;
    private readonly userRepo;
    private readonly gateway;
    constructor(repo: Repository<Appointment>, userRepo: Repository<User>, gateway: AppointmentsGateway);
    getDoctors(branchId: string): Promise<{
        id: string;
        fullName: string;
    }[]>;
    create(branchId: string, dto: CreateAppointmentDto): Promise<Appointment>;
    findAll(branchId: string, query: AppointmentQueryDto): Promise<Appointment[]>;
    findOne(branchId: string, id: string): Promise<Appointment>;
    updateStatus(branchId: string, id: string, dto: UpdateStatusDto): Promise<Appointment>;
    remove(branchId: string, id: string): Promise<void>;
    private assertNoConflict;
    emitUpdated(branchId: string, appointment: Appointment): void;
}
