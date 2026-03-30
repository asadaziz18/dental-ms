import { Server } from 'socket.io';
import { Appointment } from '../../database/entities/appointment.entity';
export declare class AppointmentsGateway {
    server: Server;
    handleJoinBranch(client: {
        join: (room: string) => void;
    }, payload: {
        branchId: string;
    }): void;
    emitAppointmentUpdated(branchId: string, appointment: Appointment): void;
    private serialize;
}
