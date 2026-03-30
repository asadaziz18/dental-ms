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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../../database/entities/appointment.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const appointments_gateway_1 = require("./appointments.gateway");
let AppointmentsService = class AppointmentsService {
    repo;
    userRepo;
    gateway;
    constructor(repo, userRepo, gateway) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.gateway = gateway;
    }
    async getDoctors(branchId) {
        const users = await this.userRepo.find({
            where: { branchId, role: 'Doctor', isActive: true },
            select: ['id', 'fullName'],
        });
        return users;
    }
    async create(branchId, dto) {
        const start = new Date(dto.start);
        const end = new Date(dto.end);
        if (end <= start) {
            throw new common_1.BadRequestException('end must be after start');
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
    async findAll(branchId, query) {
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
        }
        else if (query.date) {
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
    async findOne(branchId, id) {
        const appointment = await this.repo.findOne({
            where: { id, branchId },
            relations: ['patient', 'doctor'],
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        return appointment;
    }
    async updateStatus(branchId, id, dto) {
        const appointment = await this.findOne(branchId, id);
        appointment.status = dto.status;
        await this.repo.save(appointment);
        const full = await this.findOne(branchId, id);
        this.gateway.emitAppointmentUpdated(branchId, full);
        return full;
    }
    async remove(branchId, id) {
        const appointment = await this.findOne(branchId, id);
        await this.repo.remove(appointment);
    }
    async assertNoConflict(branchId, params) {
        const qb = this.repo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .andWhere('(a.start < :end AND a.end > :start)', { start: params.start, end: params.end });
        if (params.excludeId) {
            qb.andWhere('a.id != :excludeId', { excludeId: params.excludeId });
        }
        const overlapping = await qb.getMany();
        if (params.doctorId) {
            const doctorConflict = overlapping.find((a) => a.doctorId === params.doctorId);
            if (doctorConflict) {
                throw new common_1.ConflictException(`Doctor is already booked from ${doctorConflict.start.toISOString()} to ${doctorConflict.end.toISOString()}`);
            }
        }
        if (params.chair) {
            const chairConflict = overlapping.find((a) => a.chair === params.chair);
            if (chairConflict) {
                throw new common_1.ConflictException(`Chair/room "${params.chair}" is already in use in this time range`);
            }
        }
    }
    emitUpdated(branchId, appointment) {
        this.gateway.emitAppointmentUpdated(branchId, appointment);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        appointments_gateway_1.AppointmentsGateway])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map