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
exports.LabVendorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lab_vendor_entity_1 = require("../../database/entities/lab-vendor.entity");
const lab_order_entity_1 = require("../../database/entities/lab-order.entity");
let LabVendorsService = class LabVendorsService {
    vendorRepo;
    orderRepo;
    constructor(vendorRepo, orderRepo) {
        this.vendorRepo = vendorRepo;
        this.orderRepo = orderRepo;
    }
    async findAll(tenantId, query) {
        const qb = this.vendorRepo.createQueryBuilder('v');
        if (tenantId != null) {
            qb.andWhere('v.tenantId = :tenantId', { tenantId });
        }
        if (query.isActive !== undefined && query.isActive !== '') {
            const active = query.isActive === 'true';
            qb.andWhere('v.isActive = :active', { active });
        }
        if (query.city?.trim()) {
            qb.andWhere('v.city ILIKE :city', { city: `%${query.city.trim()}%` });
        }
        if (query.specialization?.trim()) {
            qb.andWhere("EXISTS (SELECT 1 FROM jsonb_array_elements_text(v.specializations) AS s WHERE s ILIKE :spec)", { spec: `%${query.specialization.trim()}%` });
        }
        qb.orderBy('v.name', 'ASC');
        return qb.getMany();
    }
    async findOne(id, tenantId) {
        const qb = this.vendorRepo
            .createQueryBuilder('v')
            .where('v.id = :id', { id });
        if (tenantId != null) {
            qb.andWhere('v.tenantId = :tenantId', { tenantId });
        }
        const vendor = await qb.getOne();
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async findOneWithOrderSummary(id, tenantId) {
        const vendor = await this.findOne(id, tenantId);
        const activeOrdersCount = await this.orderRepo.count({
            where: {
                vendorId: id,
                status: (0, typeorm_2.Not)((0, typeorm_2.In)(['delivered', 'cancelled', 'rejected'])),
            },
        });
        return { vendor, activeOrdersCount };
    }
    async create(tenantId, dto) {
        const vendor = this.vendorRepo.create({
            ...dto,
            tenantId,
            isActive: dto.isActive ?? true,
        });
        return this.vendorRepo.save(vendor);
    }
    async update(id, tenantId, dto) {
        const vendor = await this.findOne(id, tenantId);
        Object.assign(vendor, dto);
        return this.vendorRepo.save(vendor);
    }
    async updateStatus(id, tenantId, isActive) {
        const vendor = await this.findOne(id, tenantId);
        vendor.isActive = isActive;
        return this.vendorRepo.save(vendor);
    }
    async remove(id, tenantId) {
        const vendor = await this.findOne(id, tenantId);
        const activeCount = await this.orderRepo.count({
            where: {
                vendorId: id,
                status: (0, typeorm_2.Not)((0, typeorm_2.In)(['delivered', 'cancelled', 'rejected'])),
            },
        });
        if (activeCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete vendor: ${activeCount} active order(s) exist.`);
        }
        await this.vendorRepo.remove(vendor);
    }
};
exports.LabVendorsService = LabVendorsService;
exports.LabVendorsService = LabVendorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lab_vendor_entity_1.LabVendor)),
    __param(1, (0, typeorm_1.InjectRepository)(lab_order_entity_1.LabOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LabVendorsService);
//# sourceMappingURL=lab-vendors.service.js.map