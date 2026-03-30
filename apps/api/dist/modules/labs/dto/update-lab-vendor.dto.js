"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLabVendorDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_lab_vendor_dto_1 = require("./create-lab-vendor.dto");
class UpdateLabVendorDto extends (0, mapped_types_1.PartialType)(create_lab_vendor_dto_1.CreateLabVendorDto) {
}
exports.UpdateLabVendorDto = UpdateLabVendorDto;
//# sourceMappingURL=update-lab-vendor.dto.js.map