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
exports.ImagingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const imaging_entity_1 = require("../../database/entities/imaging.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
const storage_interface_1 = require("./storage/storage.interface");
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
let ImagingService = class ImagingService {
    imagingRepo;
    patientRepo;
    storage;
    config;
    constructor(imagingRepo, patientRepo, storage, config) {
        this.imagingRepo = imagingRepo;
        this.patientRepo = patientRepo;
        this.storage = storage;
        this.config = config;
    }
    async findByPatient(branchId, patientId) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.imagingRepo.find({
            where: { patientId, branchId },
            relations: ['uploadedBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(branchId, id) {
        const imaging = await this.imagingRepo.findOne({
            where: { id, branchId },
            relations: ['patient', 'uploadedBy'],
        });
        if (!imaging)
            throw new common_1.NotFoundException('Image not found');
        return imaging;
    }
    async upload(branchId, patientId, uploadedById, file, toothNumber) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        if (!file?.buffer)
            throw new common_1.BadRequestException('No file uploaded');
        const mime = (file.mimetype || 'image/jpeg').toLowerCase();
        if (!ALLOWED_MIMES.includes(mime)) {
            throw new common_1.BadRequestException('Only JPEG and PNG images are allowed');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File too large (max 20MB)');
        }
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        const fileKey = `imaging/${branchId}/${patientId}/${Date.now()}-${(file.originalname || 'image').replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}`;
        await this.storage.upload(fileKey, file.buffer, mime);
        const imaging = this.imagingRepo.create({
            branchId,
            patientId,
            fileKey,
            mimeType: mime,
            fileName: file.originalname || `image.${ext}`,
            toothNumber: toothNumber ?? null,
            uploadedById,
            annotations: null,
        });
        return this.imagingRepo.save(imaging);
    }
    async getPresignedUrl(branchId, id, expiresIn = 3600) {
        const imaging = await this.findOne(branchId, id);
        const driver = this.config.get('STORAGE_DRIVER', 's3');
        if (driver === 'local') {
            const baseUrl = this.config.get('APP_PUBLIC_URL', 'http://localhost:3000').replace(/\/$/, '');
            return `${baseUrl}/imaging/${id}/file`;
        }
        return this.storage.getPresignedUrl(imaging.fileKey, expiresIn);
    }
    async serveFile(branchId, id) {
        const imaging = await this.findOne(branchId, id);
        const driver = this.config.get('STORAGE_DRIVER', 's3');
        if (driver === 'local' && this.storage.getReadStream) {
            const stream = await this.storage.getReadStream(imaging.fileKey);
            if (!stream)
                throw new common_1.NotFoundException('File not found on disk');
            return { type: 'stream', stream, contentType: imaging.mimeType };
        }
        const url = await this.storage.getPresignedUrl(imaging.fileKey, 3600);
        return { type: 'redirect', url };
    }
    async update(branchId, id, dto) {
        const imaging = await this.findOne(branchId, id);
        if (dto.toothNumber !== undefined)
            imaging.toothNumber = dto.toothNumber;
        if (dto.annotations !== undefined)
            imaging.annotations = dto.annotations;
        await this.imagingRepo.save(imaging);
        return this.findOne(branchId, id);
    }
    async remove(branchId, id) {
        const imaging = await this.findOne(branchId, id);
        await this.storage.delete(imaging.fileKey);
        await this.imagingRepo.remove(imaging);
    }
};
exports.ImagingService = ImagingService;
exports.ImagingService = ImagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(imaging_entity_1.Imaging)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(2, (0, common_1.Inject)(storage_interface_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, config_1.ConfigService])
], ImagingService);
//# sourceMappingURL=imaging.service.js.map