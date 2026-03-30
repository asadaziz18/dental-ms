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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const supplier_entity_1 = require("../../database/entities/supplier.entity");
let SuppliersService = class SuppliersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findByBranch(branchId) {
        return this.repo.find({
            where: { branchId },
            order: { name: 'ASC' },
        });
    }
    async findOne(branchId, id) {
        const supplier = await this.repo.findOne({
            where: { id, branchId },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return supplier;
    }
    async create(branchId, dto) {
        const supplier = this.repo.create({
            ...dto,
            branchId,
        });
        return this.repo.save(supplier);
    }
    async update(branchId, id, dto) {
        const supplier = await this.findOne(branchId, id);
        Object.assign(supplier, dto);
        return this.repo.save(supplier);
    }
    async remove(branchId, id) {
        const supplier = await this.findOne(branchId, id);
        await this.repo.remove(supplier);
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(supplier_entity_1.Supplier)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map