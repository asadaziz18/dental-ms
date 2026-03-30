import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Appointment } from '../../database/entities/appointment.entity';

const BRANCH_ROOM_PREFIX = 'branch:';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class AppointmentsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-branch')
  handleJoinBranch(client: { join: (room: string) => void }, payload: { branchId: string }): void {
    if (payload?.branchId) {
      client.join(BRANCH_ROOM_PREFIX + payload.branchId);
    }
  }

  /**
   * Broadcast appointment:updated to everyone in the branch room.
   */
  emitAppointmentUpdated(branchId: string, appointment: Appointment): void {
    const room = BRANCH_ROOM_PREFIX + branchId;
    this.server.to(room).emit('appointment:updated', this.serialize(appointment));
  }

  private serialize(a: Appointment): Record<string, unknown> {
    const start = a.start instanceof Date ? a.start.toISOString() : String((a as unknown as { start: string }).start);
    const end = a.end instanceof Date ? a.end.toISOString() : String((a as unknown as { end: string }).end);
    const createdAt = a.createdAt instanceof Date ? a.createdAt.toISOString() : String((a as unknown as { createdAt: string }).createdAt);
    const updatedAt = a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String((a as unknown as { updatedAt: string }).updatedAt);
    const patient = (a as { patient?: { id: string; firstName: string; lastName: string } }).patient;
    const doctor = (a as { doctor?: { id: string; fullName: string } }).doctor;
    return {
      id: a.id,
      branchId: a.branchId,
      patientId: a.patientId,
      doctorId: a.doctorId,
      chair: a.chair,
      start,
      end,
      type: a.type,
      status: a.status,
      sendReminder: a.sendReminder,
      notes: a.notes,
      createdAt,
      updatedAt,
      patient: patient ? { id: patient.id, firstName: patient.firstName, lastName: patient.lastName } : undefined,
      doctor: doctor ? { id: doctor.id, fullName: doctor.fullName } : undefined,
    };
  }
}
