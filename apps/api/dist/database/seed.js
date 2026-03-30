"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_BRANCH_ID = void 0;
exports.seedDevBranch = seedDevBranch;
const bcrypt = require("bcrypt");
const branch_entity_1 = require("./entities/branch.entity");
const user_entity_1 = require("./entities/user.entity");
const tenant_entity_1 = require("./entities/tenant.entity");
exports.DEV_BRANCH_ID = '00000000-0000-0000-0000-000000000001';
const DEV_DOCTOR_ID = '00000000-0000-0000-0000-000000000002';
const DEV_PASSWORD = 'password';
async function seedDevBranch(dataSource) {
    const tenantRepo = dataSource.getRepository(tenant_entity_1.Tenant);
    let tenant = await tenantRepo.findOne({ where: { slug: 'default' } });
    if (!tenant) {
        const inserted = await tenantRepo.save(tenantRepo.create({ name: 'Default Tenant', slug: 'default' }));
        tenant = inserted;
        console.log(`Seeded tenant: ${tenant.id}`);
    }
    const branchRepo = dataSource.getRepository(branch_entity_1.Branch);
    const existingBranch = await branchRepo.findOne({ where: { id: exports.DEV_BRANCH_ID } });
    if (!existingBranch) {
        await branchRepo.insert({
            id: exports.DEV_BRANCH_ID,
            tenantId: tenant.id,
            name: 'Development Branch',
            code: 'DEV',
            address: '',
            city: '',
            phone: '',
            openingTime: '09:00',
            closingTime: '18:00',
            workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log(`Seeded branch: ${exports.DEV_BRANCH_ID}`);
    }
    else {
        const updates = {};
        if (existingBranch.tenantId === null)
            updates.tenantId = tenant.id;
        if (existingBranch.code === null || existingBranch.code === undefined)
            updates.code = 'DEV';
        if (existingBranch.address === null || existingBranch.address === undefined)
            updates.address = '';
        if (existingBranch.city === null || existingBranch.city === undefined)
            updates.city = '';
        if (existingBranch.phone === null || existingBranch.phone === undefined)
            updates.phone = '';
        if (existingBranch.openingTime === null || existingBranch.openingTime === undefined)
            updates.openingTime = '09:00';
        if (existingBranch.closingTime === null || existingBranch.closingTime === undefined)
            updates.closingTime = '18:00';
        if (existingBranch.workingDays === null || existingBranch.workingDays === undefined)
            updates.workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        if (Object.keys(updates).length > 0) {
            await branchRepo.update(exports.DEV_BRANCH_ID, updates);
            console.log(`Backfilled branch: ${exports.DEV_BRANCH_ID}`);
        }
    }
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const existingDoctor = await userRepo.findOne({ where: { id: DEV_DOCTOR_ID } });
    if (!existingDoctor) {
        const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
        await userRepo.insert({
            id: DEV_DOCTOR_ID,
            email: 'doctor@dev.local',
            passwordHash,
            fullName: 'Dev Doctor',
            role: 'Doctor',
            branchId: exports.DEV_BRANCH_ID,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log(`Seeded dev doctor: ${DEV_DOCTOR_ID} (email: doctor@dev.local, password: ${DEV_PASSWORD})`);
    }
}
//# sourceMappingURL=seed.js.map