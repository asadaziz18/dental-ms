"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const treatment_plan_entity_1 = require("../../database/entities/treatment-plan.entity");
const treatment_plan_item_entity_1 = require("../../database/entities/treatment-plan-item.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
const treatments_controller_1 = require("./treatments.controller");
const treatments_service_1 = require("./treatments.service");
let TreatmentsModule = class TreatmentsModule {
};
exports.TreatmentsModule = TreatmentsModule;
exports.TreatmentsModule = TreatmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([treatment_plan_entity_1.TreatmentPlan, treatment_plan_item_entity_1.TreatmentPlanItem, patient_entity_1.Patient]),
        ],
        controllers: [treatments_controller_1.TreatmentsController],
        providers: [treatments_service_1.TreatmentsService],
        exports: [treatments_service_1.TreatmentsService],
    })
], TreatmentsModule);
//# sourceMappingURL=treatments.module.js.map