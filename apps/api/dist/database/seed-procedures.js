"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProcedures = seedProcedures;
const procedure_entity_1 = require("./entities/procedure.entity");
const PROCEDURES = [
    { code: 'D0120', name: 'Periodic oral evaluation', description: null, defaultFee: '0' },
    { code: 'D0150', name: 'Comprehensive oral evaluation', description: null, defaultFee: '0' },
    { code: 'D0210', name: 'Intraoral - complete series', description: 'Full mouth X-rays', defaultFee: '0' },
    { code: 'D1110', name: 'Prophylaxis - adult', description: 'Adult cleaning', defaultFee: '0' },
    { code: 'D2391', name: 'Resin - 1 surface', description: 'Composite filling 1 surface', defaultFee: '0' },
    { code: 'D2392', name: 'Resin - 2 surfaces', description: 'Composite filling 2 surfaces', defaultFee: '0' },
    { code: 'D2393', name: 'Resin - 3 surfaces', description: 'Composite filling 3 surfaces', defaultFee: '0' },
    { code: 'D2740', name: 'Crown - porcelain', description: 'Porcelain crown', defaultFee: '0' },
    { code: 'D2750', name: 'Crown - porcelain fused to metal', description: 'PFM crown', defaultFee: '0' },
    { code: 'D3220', name: 'Pulpal therapy - anterior', description: 'Root canal anterior', defaultFee: '0' },
    { code: 'D3240', name: 'Pulpal therapy - molar', description: 'Root canal molar', defaultFee: '0' },
    { code: 'D7111', name: 'Extraction - coronal remnant', description: 'Simple extraction', defaultFee: '0' },
    { code: 'D7240', name: 'Extraction - full bony impact', description: 'Surgical extraction', defaultFee: '0' },
    { code: 'D6010', name: 'Implant - surgical placement', description: 'Implant body', defaultFee: '0' },
    { code: 'D6205', name: 'Pontic - porcelain fused to metal', description: 'Bridge pontic PFM', defaultFee: '0' },
];
async function seedProcedures(dataSource) {
    const repo = dataSource.getRepository(procedure_entity_1.Procedure);
    for (const p of PROCEDURES) {
        const existing = await repo.findOne({ where: { code: p.code } });
        if (!existing) {
            await repo.insert({
                ...p,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }
}
//# sourceMappingURL=seed-procedures.js.map