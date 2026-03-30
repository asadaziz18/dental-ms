import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(branchId: string, dto: CreateAppointmentDto): Promise<import("../../database/entities").Appointment>;
    findAll(branchId: string, query: AppointmentQueryDto): Promise<import("../../database/entities").Appointment[]>;
    getDoctors(branchId: string): Promise<{
        id: string;
        fullName: string;
    }[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").Appointment>;
    updateStatus(branchId: string, id: string, dto: UpdateStatusDto): Promise<import("../../database/entities").Appointment>;
    remove(branchId: string, id: string): Promise<void>;
}
