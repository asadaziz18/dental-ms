"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchId = void 0;
const common_1 = require("@nestjs/common");
exports.BranchId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const fromHeader = request.headers['x-branch-id'];
    const fromQuery = request.query?.branchId;
    const fromUser = request.user?.branchId;
    return (fromHeader ?? fromQuery ?? fromUser) || '';
});
//# sourceMappingURL=branch-id.decorator.js.map