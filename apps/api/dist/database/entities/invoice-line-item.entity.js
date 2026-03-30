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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceLineItem = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const invoice_entity_1 = require("./invoice.entity");
const procedure_entity_1 = require("./procedure.entity");
let InvoiceLineItem = class InvoiceLineItem extends base_entity_1.BaseEntity {
    invoiceId;
    invoice;
    procedureId;
    procedure;
    description;
    quantity;
    unitPrice;
    discountAmount;
    lineTotal;
};
exports.InvoiceLineItem = InvoiceLineItem;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => invoice_entity_1.Invoice, (inv) => inv.lineItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoiceId' }),
    __metadata("design:type", invoice_entity_1.Invoice)
], InvoiceLineItem.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], InvoiceLineItem.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", Object)
], InvoiceLineItem.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 1 }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "lineTotal", void 0);
exports.InvoiceLineItem = InvoiceLineItem = __decorate([
    (0, typeorm_1.Entity)('invoice_line_items')
], InvoiceLineItem);
//# sourceMappingURL=invoice-line-item.entity.js.map