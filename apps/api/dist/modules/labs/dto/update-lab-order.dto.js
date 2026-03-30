"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLabOrderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_lab_order_dto_1 = require("./create-lab-order.dto");
class UpdateLabOrderDto extends (0, mapped_types_1.PartialType)(create_lab_order_dto_1.CreateLabOrderDto) {
}
exports.UpdateLabOrderDto = UpdateLabOrderDto;
//# sourceMappingURL=update-lab-order.dto.js.map