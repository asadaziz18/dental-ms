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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const stock_service_1 = require("./stock.service");
const stock_transaction_dto_1 = require("./dto/stock-transaction.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StockController = class StockController {
    stockService;
    constructor(stockService) {
        this.stockService = stockService;
    }
    getLevels(branchId) {
        return this.stockService.getLevelsByBranch(branchId);
    }
    getLevel(branchId, itemId) {
        return this.stockService.getLevel(branchId, itemId);
    }
    recordTransaction(branchId, dto) {
        return this.stockService.recordTransaction(branchId, dto);
    }
    getTransactions(branchId, itemId, limit) {
        return this.stockService.getTransactions(branchId, itemId, limit ? parseInt(limit, 10) : 50);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getLevels", null);
__decorate([
    (0, common_1.Get)('item/:itemId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getLevel", null);
__decorate([
    (0, common_1.Post)('transaction'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_transaction_dto_1.CreateStockTransactionDto]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "recordTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('itemId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getTransactions", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('inventory/stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map