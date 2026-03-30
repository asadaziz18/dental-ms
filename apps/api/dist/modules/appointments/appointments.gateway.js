"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const BRANCH_ROOM_PREFIX = 'branch:';
let AppointmentsGateway = class AppointmentsGateway {
    server;
    handleJoinBranch(client, payload) {
        if (payload?.branchId) {
            client.join(BRANCH_ROOM_PREFIX + payload.branchId);
        }
    }
    emitAppointmentUpdated(branchId, appointment) {
        const room = BRANCH_ROOM_PREFIX + branchId;
        this.server.to(room).emit('appointment:updated', this.serialize(appointment));
    }
    serialize(a) {
        const start = a.start instanceof Date ? a.start.toISOString() : String(a.start);
        const end = a.end instanceof Date ? a.end.toISOString() : String(a.end);
        const createdAt = a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt);
        const updatedAt = a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String(a.updatedAt);
        const patient = a.patient;
        const doctor = a.doctor;
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
};
exports.AppointmentsGateway = AppointmentsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppointmentsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-branch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsGateway.prototype, "handleJoinBranch", null);
exports.AppointmentsGateway = AppointmentsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/',
    })
], AppointmentsGateway);
//# sourceMappingURL=appointments.gateway.js.map