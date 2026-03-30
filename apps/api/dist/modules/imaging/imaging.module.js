"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const imaging_entity_1 = require("../../database/entities/imaging.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
const s3_storage_service_1 = require("./storage/s3-storage.service");
const local_storage_service_1 = require("./storage/local-storage.service");
const storage_interface_1 = require("./storage/storage.interface");
const imaging_service_1 = require("./imaging.service");
const imaging_controller_1 = require("./imaging.controller");
let ImagingModule = class ImagingModule {
};
exports.ImagingModule = ImagingModule;
exports.ImagingModule = ImagingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([imaging_entity_1.Imaging, patient_entity_1.Patient]),
        ],
        controllers: [imaging_controller_1.ImagingController],
        providers: [
            {
                provide: storage_interface_1.STORAGE_SERVICE,
                useFactory: (config) => {
                    const driver = config.get('STORAGE_DRIVER', 's3');
                    if (driver === 'local') {
                        return new local_storage_service_1.LocalStorageService(config);
                    }
                    return new s3_storage_service_1.S3StorageService(config);
                },
                inject: [config_1.ConfigService],
            },
            imaging_service_1.ImagingService,
        ],
        exports: [imaging_service_1.ImagingService, storage_interface_1.STORAGE_SERVICE],
    })
], ImagingModule);
//# sourceMappingURL=imaging.module.js.map