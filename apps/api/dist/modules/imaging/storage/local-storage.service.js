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
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const fs_1 = require("fs");
let LocalStorageService = class LocalStorageService {
    config;
    uploadDir;
    constructor(config) {
        this.config = config;
        const dir = this.config.get('UPLOAD_DIR', './uploads');
        this.uploadDir = path.resolve(dir);
    }
    resolvePath(key) {
        const full = path.resolve(this.uploadDir, key);
        const base = path.resolve(this.uploadDir);
        if (!full.startsWith(base + path.sep) && full !== base) {
            throw new Error('Invalid storage key');
        }
        return full;
    }
    async upload(key, body, contentType) {
        const full = this.resolvePath(key);
        const dir = path.dirname(full);
        if (!(0, fs_1.existsSync)(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(full, body);
    }
    async delete(key) {
        const full = this.resolvePath(key);
        if ((0, fs_1.existsSync)(full)) {
            fs.unlinkSync(full);
        }
    }
    async getPresignedUrl(_key, _expiresInSeconds) {
        throw new Error('Local storage: use app serve URL (e.g. GET /imaging/:id/file)');
    }
    async getReadStream(key) {
        const full = this.resolvePath(key);
        if (!(0, fs_1.existsSync)(full))
            return null;
        return (0, fs_1.createReadStream)(full);
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map